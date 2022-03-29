import { suite } from 'uvu';
import assert from 'uvu/assert';
import { traverse } from '../../../src';
import { readJSON } from '../utils';

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
