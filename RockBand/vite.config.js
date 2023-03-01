
import { defineConfig } from 'vite'
import { copy } from '@web/rollup-plugin-copy'
import basicSsl from '@vitejs/plugin-basic-ssl'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// Allow using `@/...` in import-statement, e.g. `import name from '@/path/to/class'`
const resolve = {
	alias: {
		'@': path.resolve(__dirname, './src'),
	}
}

export default defineConfig(({ command, mode }) => {

	if (command === 'serve') {

		/**
		 * Configuration when in DEV mode via `npm run serve`
		 * Serves the files from folder `/src` at `https://localhost:3000/` with hotreload
		 * 
		 * Vite will automatically preprocess `scss`-files and compile the 
		 * JS-classes and modules.
		 * 
		 */
		// Configuration when in DEV mode, executed via `npm run serve`
		return {
			resolve,
			server: {
				hmr: false, 	// disable hot reload
				port: 3000,
				https: true,
				//open: '/'     // open URL in browser when started? 
			},
			root: path.resolve(__dirname, 'src'),
			base: '/src/',
			//base: path.resolve(__dirname, "./dist/"),
			plugins: [
				basicSsl(), 
				vue(),
			]
		}
	} else {

		/**
		 * Configuration when in BUILD mode via `npm run build`.
		 * 
		 * Steps during compiling:
		 * - compiles the files and creates the `/dist`-folder.
		 * - builds the electron app
		 * 
		 */
		// Configuration when in BUILD mode, executed via `npm run build`
		return {
			resolve,
			build: {
				outDir: path.resolve(__dirname, 'dist'),
			},
			publicDir: path.resolve(__dirname, 'public'),
			root: path.resolve(__dirname, 'src'),			
			base: '',
			plugins: [
				copy({
					rootDir: './src',
					exclude: ['*.html', '*.scss', '*.css', '.DS_Store', '**/.DS_Store', 'settings.json', 'app-mac', 'app-win', 'node-modules'],
					patterns: ['*.*', '**/*.*']
				}),
				vue()
			]
		}
	}	
})
