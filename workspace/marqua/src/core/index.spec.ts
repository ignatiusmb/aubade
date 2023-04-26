import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as core from './index.js';

const basics = {
	construct: suite('core:construct'),
	parse: suite('core:parse'),
};

basics.construct('construct simple index', () => {
	const index = core.construct(
		`
title: Simple Index
tags: [x, y, z]
		`.trim()
	);

	assert.equal(index, {
		title: 'Simple Index',
		tags: ['x', 'y', 'z'],
	});
});
basics.construct('construct marqua rules', () => {
	const index = core.construct(
		`
title: Marqua Rules
date:published: 2023-02-01
a:b:x: 0
a:b:y: 1
a:b:z: 2
		`.trim()
	);

	assert.equal(index, {
		title: 'Marqua Rules',
		date: { published: '2023-02-01' },
		a: { b: { x: '0', y: '1', z: '2' } },
	});
});
basics.construct('convert boolean values', () => {
	const index = core.construct(
		`
title: Casting Boolean
draft: false
hex: ["x", true, 0, false]
		`.trim()
	);

	assert.equal(index, {
		title: 'Casting Boolean',
		draft: false,
		hex: ['x', true, '0', false],
	});
});
basics.construct('construct literal block', () => {
	const index = core.construct(
		`
title: Literal Block
data: |
	Hello World
	Lorem Ipsum
		`.trim()
	);

	assert.equal(index, {
		title: 'Literal Block',
		data: 'Hello World\nLorem Ipsum',
	});
});
basics.construct('construct sequences', () => {
	const index = core.construct(
		`
title: List Sequence
hex:
	- 'x'
	- true
	- 0
		`.trim()
	);

	assert.equal(index, {
		title: 'List Sequence',
		hex: ['x', true, '0'],
	});
});
basics.construct('construct indents', () => {
	const index = core.construct(
		`
title: Indented Objects
jobs:
	test:
		with: node
	sync:
		with: pnpm
		`.trim()
	);

	assert.equal(index, {
		title: 'Indented Objects',
		jobs: {
			test: { with: 'node' },
			sync: { with: 'pnpm' },
		},
	});
});
basics.construct('construct indented sequences', () => {
	const index = core.construct(
		`
title: Indented Objects and Arrays
jobs:
	test:
		- with: node
			os: windows
	sync:
		- with: pnpm
			os: linux
			env:
				TOKEN: 123
		`.trim()
	);

	assert.equal(index, {
		title: 'Indented Objects and Arrays',
		jobs: {
			test: [{ with: 'node', os: 'windows' }],
			sync: [{ with: 'pnpm', os: 'linux', env: { TOKEN: '123' } }],
		},
	});
});
basics.construct('handle edge cases', () => {
	const index = core.construct(
		`
title: Edge Cases
name: "Hello: World"
link: https://github.com
		`.trim()
	);

	assert.equal(index, {
		title: 'Edge Cases',
		name: 'Hello: World',
		link: 'https://github.com',
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
