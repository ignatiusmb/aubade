import { createBundle } from 'dts-buddy';
import * as pkg from '../package.json';

await createBundle({
	output: 'index.d.ts',
	// modules: Object.entries(pkg.exports).reduce((acc, [exp, entry]) => {
	// 	return { ...acc, [`marqua/${exp.slice(2)}`]: `./src/${entry.slice(2)}` };
	// }, {}),
	modules: {
		marqua: './src/core/index.js',
		'marqua/artisan': './src/artisan/index.js',
		'marqua/browser': './src/browser/index.js',
		'marqua/fs': './src/fs/index.js',
		'marqua/transform': './src/transform/index.js',
	},
});
