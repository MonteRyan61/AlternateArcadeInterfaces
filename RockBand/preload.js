const { contextBridge, ipcRenderer, webFrame } = require('electron')
const { Board, Log } = require('nnarduino')

webFrame.setZoomFactor(1)

ipcRenderer.invoke('getSettings').then( settings => {
	
	let board = new Board()
	let availableBoards = []
	let currentDevice = settings.device || ''

	const onSelectBoard = ( event, sel ) => {
		ipcRenderer.invoke('setTitle', `connecting to ${sel.path}...`)
		board.connect( sel.path ).catch( e => {
			sel.path = ''
			currentDevice = ''
		})
		availableBoards.forEach( obj => {
			obj.selected = obj.path == sel.path
		})
		ipcRenderer.invoke('setAvailableBoards', availableBoards )
		ipcRenderer.invoke('saveSettings', {device:sel.path} )
	}

	ipcRenderer.invoke('setTitle', 'searching for board...')

	board.listDevices().then( devices => {
		availableBoards = devices.map( obj => {
			return {
				path: obj.path,
				label: obj.path,
				selected: false,
			}
		})
		availableBoards.unshift({
			path: '',
			label: 'Automatic detection',
			selected: false
		})
		ipcRenderer.invoke('setAvailableBoards', availableBoards )
		ipcRenderer.on('onSelectBoard', onSelectBoard)
		onSelectBoard( null, {path:currentDevice})
	})
/*
	board.connect( currentDevice ).then(( data ) => {
		Log.SUCCESS('Board connected', data);
	}).catch( e => {});
*/
	board.cmd({setIV:30});

	board.on('error', ( obj ) => {
		ipcRenderer.invoke('setTitle', `ERROR: ${obj.message}`)
		ipcRenderer.invoke('openDevTools')
	})
	
	board.on('status', ({ text }) => {
		ipcRenderer.invoke('setTitle', `${text}`)
	})

	board.on('portOpened', ({ path, port }) => {
		ipcRenderer.invoke('setTitle', `handshake ${path}`)
	})

	board.on('handshake', ({ path, port }) => {
		ipcRenderer.invoke('setTitle', `✓ connected to ${path}`)
	})
	
	contextBridge.exposeInMainWorld('Arduino', {
		cmd: ( cmdArray) => {
			board.cmd( cmdArray );
		},
		on: ( event, callback ) => {
			board.on( event, callback );
		},
		off: ( event, callback ) => {
			board.off( event, callback );
		},
		injectSketchJs: async () => {
			ipcRenderer.invoke('copySketchJs')
			const script = document.createElement('script')
			script.src = settings.sketchJsPath
			document.body.appendChild(script)
		},
		resizeWindow: ( w, h ) => {
			ipcRenderer.invoke('resizeWindow', w, h)
		},
		openDevTools: () => {
			ipcRenderer.invoke('openDevTools')
		},
		quit: () => {
			ipcRenderer.invoke('quit')
		},
		setTitle: ( title ) => {
			ipcRenderer.invoke('setTitle', title)
		}
	});

}).catch( error => {
	console.log( 'ERROR from preload.js: ' + error )
})


window.addEventListener("DOMContentLoaded", () => {
	
	contextBridge.exposeInMainWorld('electron', {
		invoke: async (channel, ...args) => {
			return await ipcRenderer.invoke(channel, ...args)
		}
	});

});

/*
	board.cmd([
		{addSensor:{pin:2, type:10}},
		{addSensor:{pin:"A0", type:20}}, 
	]);

	board.cmd({addSensor:{pin:5, dt:4, sw:3, type:30}});

	//board.cmd({pinMode:{pin:13, mode:1}});
*/

/*	
	for (var i = 0; i < 10; i++) {
		board.cmd({digitalWrite:{pin:13, val:1}}, {delay:1000});
		board.cmd({digitalWrite:{pin:13, val:0}}, {delay:1000});
	}
*/
