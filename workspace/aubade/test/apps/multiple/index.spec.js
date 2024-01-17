import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { traverse } from '../../../src/fs/index.js';
import { readJSON } from '../utils.js';

const basics = {
	standard: suite('multiple:standard'),
	depth: suite('multiple:depth'),
};

const target = `${process.cwd()}/test/apps/multiple`;

basics.standard('standard traversal', () => {
	const output = traverse({ entry: `${target}/standard/input` }, ({ buffer, marker, parse }) => {
		const { body, metadata } = parse(buffer.toString('utf-8'));
		return { ...metadata, content: marker.render(body) };
	});
	const expected = readJSON(`${target}/standard/expected.json`);

	assert.type(output, 'object');
	assert.type(expected, 'object');

	assert.equal(output, expected);
});

basics.depth('depth traversal', () => {
	const output = traverse(
		{ entry: `${target}/depth/input`, depth: 1 },
		({ buffer, marker, parse }) => {
			const { body, metadata } = parse(buffer.toString('utf-8'));
			return { ...metadata, content: marker.render(body) };
		},
	);
	const expected = readJSON(`${target}/depth/expected.json`);

	assert.type(output, 'object');
	assert.type(expected, 'object');

	assert.equal(output, expected);
});

Object.values(basics).forEach((v) => v.run());
