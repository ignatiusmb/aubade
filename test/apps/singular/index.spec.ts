import { suite } from 'uvu';
import assert from 'uvu/assert';
import { readJSON } from '../utils';

const basics = {
	standard: suite('singular:standard'),
};

const target = `${process.cwd()}/test/apps/singular`;

basics.standard('', () => {
	const expected = readJSON(`${target}/standard/expected.json`);
	assert.type(expected, 'object');
});

Object.values(basics).forEach((v) => v.run());
