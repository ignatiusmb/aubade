import * as fs from 'node:fs';
import { createBundle } from 'dts-buddy';
import { exports } from '../package.json';

walk('./src', (path) => path.endsWith('.js') && fs.unlinkSync(path));

await createBundle({
	output: 'index.d.ts',
	modules: Object.keys(exports).reduce((acc, key) => {
		if (key === './artisan') return acc; // TODO: why did this fails
		if (key.slice(2).includes('.')) return acc; // skip non-modules
		return { ...acc, ['marqua' + key.slice(1)]: exports[key] };
	}, {}),
});

// ---- helper functions ----

function walk(entry: string, fn: (pathname: string) => void) {
	for (const name of fs.readdirSync(entry)) {
		const path = `${entry}/${name}`;
		if (fs.statSync(path).isDirectory()) {
			walk(path, fn);
		} else {
			fn(path);
		}
	}
}
