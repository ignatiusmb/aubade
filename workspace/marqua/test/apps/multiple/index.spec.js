import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import { traverse } from '../../../index.js';
import { readJSON } from '../utils.js';

const basics = {
	standard: suite('multiple:standard'),
};

const target = `${process.cwd()}/test/apps/multiple`;

basics.standard('standard traversal', () => {
	const output = traverse(`${target}/standard/input`);
	const expected = readJSON(`${target}/standard/expected.json`);

	assert.type(output, 'object');
	assert.type(expected, 'object');

	assert.equal(output, expected);
});

Object.values(basics).forEach((v) => v.run());
