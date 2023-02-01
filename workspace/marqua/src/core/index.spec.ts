import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as core from './index.js';

const basics = {
	construct: suite('core:construct'),
	parse: suite('core:parse'),
};

basics.construct('construct front matter index correctly', () => {
	const index = core.construct(
		`
title: Hello World
date:published: 2023-02-01
	`.trim()
	);

	assert.equal(index, {
		title: 'Hello World',
		date: { published: '2023-02-01' },
	});
});

Object.values(basics).forEach((v) => v.run());
