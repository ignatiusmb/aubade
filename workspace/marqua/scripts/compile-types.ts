import { createBundle } from 'dts-buddy';
import { exports } from '../package.json';

await createBundle({
	output: 'index.d.ts',
	modules: Object.keys(exports).reduce((acc, key) => {
		if (key.slice(2).includes('.')) return acc; // skip non-modules
		return { ...acc, ['marqua' + key.slice(1)]: exports[key].default };
	}, {}),
});
