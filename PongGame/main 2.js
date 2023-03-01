const { app, Notification, BrowserWindow, Menu, ipcMain, dialog, shell } = require("electron")
const { Board, Log } = require('nnarduino')
const path = require("path")
const fs = require("fs")

const isDev = process.env.IS_DEV === 'true'
let win

app.commandLine.appendSwitch('ignore-certificate-errors')
app.commandLine.appendSwitch('allow-insecure-localhost', 'true')
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

function createWindow() {
	win = new BrowserWindow({
		width: 800 /*+ (isDev ? 400 : 0)*/,
		height: 600,
		useContentSize: true,
		center: true,
		zoomFactor: 1.0,
		//frame: false,
		webPreferences: {
			webSecurity: false,
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: true, 
//			contextIsolation: true,
//			sandbox: false
		},
	});

	if (isDev) {
		//win.webContents.openDevTools();
		win.loadURL("https://localhost:3000");
		//win.loadFile('dist/index.html');
	} else {
		win.loadFile(path.join(__dirname, 'dist', 'index.html'));
	}
}

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});

	// app.on('certificate-error', function(event, webContents, url, error, certificate, callback) {
	// 	event.preventDefault();
	// 	callback(true);
	// });

});

// app.on("window-all-closed", () => {
// 	if (process.platform !== "darwin") {
// 		app.quit();
// 	}
// });

// ---------------------------------------------------------------------

const isMac = process.platform === 'darwin'

const relaunchApp = () => {
	app.relaunch()
	app.exit()
}

const refreshApp = () => {
	win.webContents.reloadIgnoringCache()
}

const openDevTools = () => {
	win.webContents.openDevTools({ mode: 'detach' })
}

const openSketch = () => 
{
	dialog.showOpenDialog({ 
		properties: ['openFile'],
		filters: [{name:'JavaScript files', extensions:['js']}] 
	}).then( result => {
		if (result.canceled) return
		const file = result.filePaths.shift()
		saveSettings({sketchJs:file})
		copySketchJs()
		refreshApp()
		shell.openExternal('file://' + file)
	}).catch( err => {
		console.log( err )
	})
}

const openDefaultSketch = () => {
	saveSettings({sketchJs:defaultSettings.sketchJs}, true)
	copySketchJs()
	refreshApp()
}

const showCurrentSketch = async () => {
	const settings = await getSettings()
	const sketchJs = settings.sketchJs || false
	shell.showItemInFolder( settings.sketchJs )
}

const createSketch = () => 
{
	dialog.showSaveDialog({
		title: 'Select where to save the p5js sketch',
		defaultPath: 'sketch.js',
		properties: ['createDirectory'],
	}).then( result => {
		if (result.canceled) return

		let filepath = result.filePath
		if (filepath.slice(-3) !== '.js') {
			filepath += '.js'
		}

		fs.writeFileSync( filepath, "\nfunction setup () {\n\tcreateCanvas(800, 600)\n}\n\nfunction draw () {\n\tbackground( 255 );\n}")
		saveSettings({sketchJs:filepath})
		copySketchJs(filepath)
		shell.openExternal('file://' + filepath)
	}).catch( err => {
		console.log( err )
	})
}


let template = [
	// { role: 'appMenu' }
	...(isMac ? [{
		label: app.name,
		submenu: [
			{ role: 'about' },
			{ type: 'separator' },
			{ role: 'services' },
			{ type: 'separator' },
			{ role: 'hide' },
			{ role: 'hideOthers' },
			{ role: 'unhide' },
			{ type: 'separator' },
			{ role: 'quit' }
		]
	}] : []),
	// { role: 'fileMenu' }
	{
		label: 'File',
		submenu: [
			{
				label: 'New sketch',
				accelerator: 'CommandOrControl+n',
				click: createSketch
			},
			{
				label: 'Open sketch',
				accelerator: 'CommandOrControl+o',
				click: openSketch
			},
			{
				label: 'Open default sketch',
				accelerator: 'CommandOrControl+Shift+o',
				click: openDefaultSketch
			},
			{
				label: 'Show current sketch in Finder',
				click: showCurrentSketch
			},
			{ type: 'separator' },
			{ role: 'quit' }
		]
	},
	{
		label: 'Board'
	},
	//{ role: 'editMenu' },
	{
		label: 'Edit',
		submenu: [
			{ role: 'undo' },
			{ role: 'redo' },
			{ type: 'separator' },
			{ role: 'cut' },
			{ role: 'copy' },
			{ role: 'paste' },
			{ role: 'delete' },
			{ type: 'separator' },
			{ role: 'selectAll' }
		]
	},
	// { role: 'viewMenu' }
	{
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{
				label: 'Open Debugger',
				accelerator: 'CommandOrControl+Alt+i',
				click: openDevTools
			},
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
		]
	},
	{
		label: 'Help',
		submenu: [
			{
				label: 'Documentation',
				click: () => {
					shell.openExternal('https://labor.99grad.de/typo3-docs/nnarduino/sensors/index.html')
				}
			},
		]
	}
]

let menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

ipcMain.handle('setAvailableBoards', ( event, list ) => {

	const menuPos = isMac ? 2 : 1

	template[menuPos] = {
		label: 'Board',
		submenu: []
	};

	list.forEach(( obj ) => {
		template[menuPos].submenu.push({
			label: obj.label, 
			type: 'checkbox', 
			checked: obj.selected,
			click: () => { 
				win.webContents.send('onSelectBoard', obj)
				refreshApp()
			}
		});
	});

	let menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
});


// ---------------------------------------------------------------------

ipcMain.handle('resizeWindow', ( event, w, h ) => {
	/*
	if (!isMac) {
		w += 16
		h += 63
	}
	*/
	win.setSize( w, h )
})

ipcMain.handle('setTitle', ( event, title ) => {
	win.setTitle( title )
})

ipcMain.handle('refreshApp', ( event ) => {
	refreshApp()
})

ipcMain.handle('openDevTools', ( event ) => {
	openDevTools()
})

ipcMain.handle('copySketchJs', ( event ) => {
	copySketchJs()
})


// ---------------------------------------------------------------------

const userDataPath = app.getPath('userData')
const settingsFilePath = path.join(userDataPath, 'nnarduino_settings.json')
const PATH_SEPERATOR = path.sep
const ABS_FILE_PREFIX = 'file:/'

const sketchJsTargetPath = [userDataPath, 'dist']

let cachedSettings = null

const defaultSettings = {
	device: '',
	sketchJs: path.join( app.getAppPath(), 'src', 'sketch.js')
}

const copySketchJs = async () => 
{
	try {
		console.log('\n')
		const settings = await getSettings()
		const sketchJs = settings.sketchJs || false
		if (!sketchJs) return
		if (!fs.existsSync(sketchJs)) return
	
		let srcFolder = null
		if (isMac) {
			srcFolder = sketchJs.split(PATH_SEPERATOR).slice(1, -1)
			srcFolder.unshift( PATH_SEPERATOR )	
		} else {
			srcFolder = sketchJs.split(PATH_SEPERATOR).slice(0, -1)
		}
		
		if (!srcFolder) return
	
		let script = fs.readFileSync( sketchJs, {encoding:'utf8', flag:'r'} )
		const regEx = /(['"])(([^'"]*)\.(jpg|jpeg|png|gif|svg|bmp|mov|aiff|aif|mp3|mp4|ttf|otf|woff|wof))(['"])/gmi
		
		const results = [...script.matchAll( regEx )].map( n => n[2] )
	
		results.forEach((filePath) => {
			
			// `images/bild.jpg` ==> ['images', 'bild.jpg']
			const filePathArr = filePath.split('/')
	
			// `../../images/bild.jpg` ==> `images/bild.jpg`
			const cleanFilePath = filePath.replace('../', '')
	
			// ['/Users/99grad/nnarduino/', 'dist', 'images', 'bild.jpg']
			const cleanFilePathArr = [...sketchJsTargetPath, ...cleanFilePath.split('/')]
	
			// `loadImage('images/bild.jpg')` ==> `loadImage('file:///Users/99grad/nnarduino/dist/images/bild.jpg')`
			script = script.replace( filePath, path.join(ABS_FILE_PREFIX, ...cleanFilePathArr).split(PATH_SEPERATOR).join('/') )
	
			// ['/Users/99grad/nnarduino/', 'dist', 'images']
			cleanFilePathArr.pop()
	
			// `bild.jpg`
			const destFile = filePathArr.pop()
	
			// `/path/to/sketch/images/bild.jpg`
			const srcDir = path.join( ...srcFolder, ...filePathArr )
	
			// `/Users/99grad/nnarduino/dist/images`
			const destDir = path.join( ...cleanFilePathArr )
	
			if (!fs.existsSync(destDir)) {
				console.log(`copySketchJs(): Creating DIR ${destDir}`)
				fs.mkdirSync(destDir, { recursive: true });
			}
	
			console.log(`copySketchJs(): copying FILE ${path.join(srcDir, destFile)} --> ${path.join(destDir, destFile)}`)
			fs.copyFileSync( path.join(srcDir, destFile),path.join(destDir, destFile), fs.constants.COPYFILE_FICLONE, (err) => {
				console.log( err )
			})
		})
	
		// `/Users/99grad/nnarduino/dist`
		const sketchJsDestPath = path.join(...sketchJsTargetPath)
	
		if (!fs.existsSync(sketchJsDestPath)) {
			console.log(`copySketchJs(): Creating DIR ${sketchJsDestPath}`)
			fs.mkdirSync(sketchJsDestPath, { recursive: true });
		}
	
		// `/Users/99grad/nnarduino/dist/sketch.js`
		const sketchJsDestFile = path.join(...sketchJsTargetPath, 'sketch.js')
		console.log(`copySketchJs(): writing ${sketchJsDestFile}\n`)
		fs.writeFileSync( sketchJsDestFile, script )

	} catch ( err ) {
		win.setTitle( `ERROR copySketchJs(): ${err}` )
	}	
}


const getSettings = () => 
{
	return new Promise((resolve, reject) => {
		try {
			if (cachedSettings) {
				return resolve(cachedSettings)
			}
			if (!fs.existsSync(settingsFilePath)) {
				fs.writeFileSync(settingsFilePath, JSON.stringify(defaultSettings), '', (err) => reject(err))
			}
			let settings = fs.readFileSync( settingsFilePath, {encoding:'utf8', flag:'r'} )
			settings = JSON.parse(settings) || {}
			settings.sketchJsPath = path.join(ABS_FILE_PREFIX, ...sketchJsTargetPath, 'sketch.js')
			cachedSettings = settings || {}
			resolve( cachedSettings )
		} catch ( error ) {
			win.setTitle( `ERROR getSettings() from ${settingsFilePath}: ` + error )
			openDefaultSketch()
			resolve( cachedSettings )
		}
	})
}

const saveSettings = async ( obj, override = false ) => 
{
	try {
		let settings = override ? {} : await getSettings()
		for (let k in obj) {
			settings[k] = obj[k]
		}
		fs.writeFileSync(settingsFilePath, JSON.stringify(settings), '', (err) => {
			console.log(`Could not write settings to ${settingsFilePath}: ${err}`)
		})
		cachedSettings = settings
		return settings
	} catch (error) {
		win.setTitle( `ERROR saveSettings() to ${settingsFilePath}: ` + error )
		return settings
	}
}

ipcMain.handle('getSettings', () => getSettings() )

ipcMain.handle('saveSettings', ( event, obj ) => saveSettings( obj ) )


// ---------------------------------------------------------------------

// Quit the app
ipcMain.handle('quit', () => {
	app.exit();
});

// write image files with data received from p5 sketch
ipcMain.handle('image:save', (event, data) => {
	return new Promise((resolve, reject) => {
		const { dataURL, fileName } = data;
		const base64Data = dataURL.replace(/^data:image\/jpeg;base64,/, "");
//      const filePath = path.join(__dirname, '../export', fileName) // app.getPath();

		const dir = path.join(app.getAppPath(), '..', '..', '..', '..', 'export');

		// const dir = path.join(app.getAppPath(), 'export');
		var filePath = path.join(dir, fileName)
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		fs.writeFile(filePath, base64Data, 'base64', (err) => {
			if (err) return reject( err );
			resolve( filePath );
		});
	});
});

// write log file
ipcMain.handle('log:write', (event, data) => {
	return new Promise((resolve, reject) => {
		const {message, file, line, col, error} = data;
		const filePath = path.join(__dirname, 'log', 'error.txt');
		const tstamp = new Date();
		fs.appendFile(filePath, `\n\n${tstamp}\n${file}\nLine: ${line}\n${message}\n${error}`, function (err) {
				if (err) return reject( err );
				resolve();
		});
	});
});


