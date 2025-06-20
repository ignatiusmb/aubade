import { describe } from 'vitest';
import { traverse } from '../../src/compass/index.js';
import { readJSON } from './utils.js';

describe('singular', ({ concurrent: it }) => {
	const target = `${process.cwd()}/test/apps/singular`;

	it('standard', ({ expect }) => {
		const expected = readJSON(`${target}/standard/expected.json`);
		expect(expected).toBeTypeOf('object');
	});
});

describe('traverse', ({ concurrent: it }) => {
	const target = `${process.cwd()}/test/apps/multiple`;

	it('standard', ({ expect }) => {
		const output = traverse(`${target}/standard/input`).hydrate(({ buffer, marker, parse }) => {
			const { body, metadata } = parse(buffer.toString('utf-8'));
			return { ...metadata, content: marker.render(body) };
		});
		const expected = readJSON(`${target}/standard/expected.json`);

		expect(output).toBeTypeOf('object');
		expect(expected).toBeTypeOf('object');

		expect(output).toEqual(expected);
	});

	it('depth=1', ({ expect }) => {
		const output = traverse(`${target}/depth/input`, { depth: 1 }).hydrate(
			({ buffer, marker, parse }) => {
				const { body, metadata } = parse(buffer.toString('utf-8'));
				return { ...metadata, content: marker.render(body) };
			},
		);
		const expected = readJSON(`${target}/depth/expected.json`);

		expect(output).toBeTypeOf('object');
		expect(expected).toBeTypeOf('object');

		expect(output).toEqual(expected);
	});
});
