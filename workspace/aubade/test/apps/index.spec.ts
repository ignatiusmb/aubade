import { describe } from 'vitest';
import { traverse } from '../../src/compass/index.js';
import { readJSON } from './utils.js';

const target = `${process.cwd()}/test/apps`;
describe('traverse', ({ concurrent: it }) => {
	it('metadata', async ({ expect }) => {
		const output = await traverse(`${target}/metadata/input`);
		const expected = readJSON(`${target}/metadata/expected.json`);

		expect(output).toBeTypeOf('object');
		expect(expected).toBeTypeOf('object');

		expect(output).toEqual(expected);
	});

	it('multiple', async ({ expect }) => {
		const output = await traverse(`${target}/multiple/input`);
		const expected = readJSON(`${target}/multiple/expected.json`);

		output.sort((x, y) => x.title.localeCompare(y.title));

		expect(output).toBeTypeOf('object');
		expect(expected).toBeTypeOf('object');

		expect(output).toEqual(expected);
	});

	it('nested-1', async ({ expect }) => {
		const output = await traverse(`${target}/nested-1/input`);
		const expected = readJSON(`${target}/nested-1/expected.json`);

		output.sort((x, y) => x.title.localeCompare(y.title));

		expect(output).toBeTypeOf('object');
		expect(expected).toBeTypeOf('object');

		expect(output).toEqual(expected);
	});
});
