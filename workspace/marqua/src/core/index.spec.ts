import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as core from './index.js';

const basics = {
	construct: suite('core:construct'),
	parse: suite('core:parse'),
};

basics.construct('construct front matter index', () => {
	const index = core.construct(
		`
title: Hello Constructor
tags: []
date:published: 2023-02-01
		`.trim()
	);

	assert.equal(index, {
		title: 'Hello Constructor',
		tags: [],
		date: { published: '2023-02-01' },
	});
});

basics.parse('parse markdown contents', () => {
	const { content, metadata } = core.parse(
		`
---
title: Hello Parser
---

Welcome to the contents
		`.trim()
	);

	assert.equal(metadata, {
		title: 'Hello Parser',
		estimate: 1,
		table: [],
	});

	assert.equal(content.trim(), 'Welcome to the contents');
});

Object.values(basics).forEach((v) => v.run());
