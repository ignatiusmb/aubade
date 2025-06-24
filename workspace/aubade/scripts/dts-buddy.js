import * as fs from 'node:fs';
import { createBundle } from 'dts-buddy';
import pkg from '../package.json' with { type: 'json' };

await createBundle({
	output: 'index.d.ts',
	modules: Object.keys(pkg.exports).reduce((acc, key) => {
		if (key.slice(2).includes('.')) return acc; // skip non-modules
		const entry = `./src/${key.slice(2) || 'core'}/index.js`;
		return { ...acc, ['aubade' + key.slice(1)]: entry };
	}, {}),
});

for (const subpath of Object.keys(pkg.exports).filter((k) => k.includes('*'))) {
	const parent = subpath.slice(0, subpath.lastIndexOf('/'));
	const ext = subpath.slice(subpath.lastIndexOf('*') + 1);
	const files = fs.readdirSync(parent).filter((f) => f.endsWith(ext));
	fs.writeFileSync(
		`${parent}/index.d.ts`,
		files.map((f) => `declare module 'aubade/${parent.slice(2)}/${f}' {}`).join('\n'),
	);
}
