import { suite } from 'uvu';
import * as assert from 'uvu/assert';
import * as core from './index.js';

const suites = {
	'construct/': suite('core/construct'),
	'construct/table': suite('core/construct:table'),
	'parse/': suite('core/parse'),
};

suites['construct/']('construct simple index', () => {
	const index = core.construct(
		`
title: Simple Index
tags: [x, y, z]
		`.trim(),
	);

	assert.equal(index, {
		title: 'Simple Index',
		tags: ['x', 'y', 'z'],
	});
});
suites['construct/']('construct aubade rules', () => {
	const index = core.construct(
		`
title: Aubade Rules
date:published: 2023-02-01
a:b:x: 0
a:b:y: 1
a:b:z: 2
		`.trim(),
	);

	assert.equal(index, {
		title: 'Aubade Rules',
		date: { published: '2023-02-01' },
		a: { b: { x: '0', y: '1', z: '2' } },
	});
});
suites['construct/']('convert boolean values', () => {
	const index = core.construct(
		`
title: Casting Boolean
draft: false
hex: ["x", true, 0, false]
		`.trim(),
	);

	assert.equal(index, {
		title: 'Casting Boolean',
		draft: false,
		hex: ['x', true, '0', false],
	});
});
suites['construct/']('construct literal block', () => {
	const index = core.construct(
		`
title: Literal Block
data: |
	Hello World
	Lorem Ipsum
		`.trim(),
	);

	assert.equal(index, {
		title: 'Literal Block',
		data: 'Hello World\nLorem Ipsum',
	});
});
suites['construct/']('construct sequences', () => {
	const index = core.construct(
		`
title: List Sequence
hex:
	- 'x'
	- true
	- 0
		`.trim(),
	);

	assert.equal(index, {
		title: 'List Sequence',
		hex: ['x', true, '0'],
	});
});
suites['construct/']('construct nested sequences', () => {
	const index = core.construct(
		`
title: Nested Sequences
colors:
	- red:
			- ff0000
			- 255-0-0
		green:
			- 00ff00
			- 0-255-0
		blue:
			- 0000ff
			- 0-0-255
	- red:
			- ff0000
			- 255-0-0
		green:
			- 00ff00
			- 0-255-0
		blue:
			- 0000ff
			- 0-0-255
		`.trim(),
	);

	assert.equal(index, {
		title: 'Nested Sequences',
		colors: [
			{ red: ['ff0000', '255-0-0'], green: ['00ff00', '0-255-0'], blue: ['0000ff', '0-0-255'] },
			{ red: ['ff0000', '255-0-0'], green: ['00ff00', '0-255-0'], blue: ['0000ff', '0-0-255'] },
		],
	});
});
suites['construct/']('construct indents', () => {
	const index = core.construct(
		`
title: Indented Objects
jobs:
	test:
		with: node
		path: ./test
	sync:
		with: pnpm
		`.trim(),
	);

	assert.equal(index, {
		title: 'Indented Objects',
		jobs: {
			test: { with: 'node', path: './test' },
			sync: { with: 'pnpm' },
		},
	});
});
suites['construct/']('construct indented sequences', () => {
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
		`.trim(),
	);

	assert.equal(index, {
		title: 'Indented Objects and Arrays',
		jobs: {
			test: [{ with: 'node', os: 'windows' }],
			sync: [{ with: 'pnpm', os: 'linux', env: { TOKEN: '123' } }],
		},
	});
});
suites['construct/']('handle carriage returns', () => {
	// with tabs
	assert.equal(core.construct(`link:\r\n\tmal: abc\r\n\timdb:\r\n\t\t- abc\r\n\t\t- def`), {
		link: { mal: 'abc', imdb: ['abc', 'def'] },
	});

	// with spaces
	assert.equal(core.construct(`link:\r\n  mal: abc\r\n  imdb:\r\n    - abc\r\n    - def`), {
		link: { mal: 'abc', imdb: ['abc', 'def'] },
	});
});
suites['construct/']('handle edge cases', () => {
	assert.equal(
		core.construct(
			`
title: Edge Cases
empty:

name: "Hello: World"
link:
	normal: https://github.com
	dashed:
		- https://myanimelist.net/anime/25537/Fate_stay_night_Movie__Heavens_Feel_-_I_Presage_Flower
		- https://myanimelist.net/anime/33049/Fate_stay_night_Movie__Heavens_Feel_-_II_Lost_Butterfly
		- https://myanimelist.net/anime/33050/Fate_stay_night_Movie__Heavens_Feel_-_III_Spring_Song
			`.trim(),
		),
		{
			title: 'Edge Cases',
			empty: '',
			name: 'Hello: World',
			link: {
				normal: 'https://github.com',
				dashed: [
					'https://myanimelist.net/anime/25537/Fate_stay_night_Movie__Heavens_Feel_-_I_Presage_Flower',
					'https://myanimelist.net/anime/33049/Fate_stay_night_Movie__Heavens_Feel_-_II_Lost_Butterfly',
					'https://myanimelist.net/anime/33050/Fate_stay_night_Movie__Heavens_Feel_-_III_Spring_Song',
				],
			},
		},
	);

	assert.equal(
		core.construct(
			`
trailing:\t
	- tab
invisible: 
	- trailing space
multiple:\t\t\t
	- tabs
voyager:   
	- multiple space
			`.trim(),
		),
		{
			trailing: ['tab'],
			invisible: ['trailing space'],
			multiple: ['tabs'],
			voyager: ['multiple space'],
		},
	);
});
suites['construct/']('construct with spaces indents', () => {
	const index = core.construct(
		`
jobs:
  test:
    with: node
    path: ./test
    cache:
      - ./.cache
      - ~/.cache
      - /tmp/cache
  sync:
    - with: npm
      os: linux
    - with: pnpm
      os: windows

link:
  github: https://github.com
  youtube: https://youtube.com
  search-engines:
    - https://duckduckgo.com
    - https://google.com
    - https://bing.com
    `.trim(),
	);

	assert.equal(index, {
		jobs: {
			test: {
				with: 'node',
				path: './test',
				cache: ['./.cache', '~/.cache', '/tmp/cache'],
			},
			sync: [
				{ with: 'npm', os: 'linux' },
				{ with: 'pnpm', os: 'windows' },
			],
		},
		link: {
			github: 'https://github.com',
			youtube: 'https://youtube.com',
			'search-engines': ['https://duckduckgo.com', 'https://google.com', 'https://bing.com'],
		},
	});
});

suites['construct/table']('generate hash from delimited heading', () => {
	const { metadata } = core.parse(
		`
---
title: Hello Parser
rating: [8, 7, 9]
---

## !{rating:0}/10 | $(story & plot)

story and plot contents
		`.trim(),
	);

	assert.equal(metadata.table, [
		{
			id: 'story-plot',
			level: 2,
			title: '8/10 | story & plot',
		},
	]);
});
suites['construct/table']('fill sections as expected', () => {
	const { metadata } = core.parse(
		`
---
title: Hello Parser
rating: [8, 7, 9]
---

## simple heading

simple contents

## story & plot

story and plot

### sub-story

sub-story contents

#### smallest heading

something here

### sub-plot
		`.trim(),
	);

	assert.equal(metadata.table[0], {
		id: 'simple-heading',
		level: 2,
		title: 'simple heading',
	});
	assert.equal(metadata.table[1], {
		id: 'story-plot',
		level: 2,
		title: 'story & plot',
	});
	assert.equal(metadata.table[2], {
		id: 'story-plot-sub-story',
		level: 3,
		title: 'sub-story',
	});
	assert.equal(metadata.table[3], {
		id: 'story-plot-sub-story-smallest-heading',
		level: 4,
		title: 'smallest heading',
	});
	assert.equal(metadata.table[4], {
		id: 'story-plot-sub-plot',
		level: 3,
		title: 'sub-plot',
	});
});
suites['construct/table']('trim comments correctly', () => {
	const { metadata } = core.parse(
		`
---
title: headings inside comments
---

## simple heading

### story

<!--
### plot
-->

### sub-story

### sub-plot
		`.trim(),
	);

	assert.equal(metadata.table.length, 4);
});

suites['parse/']('parse markdown contents', () => {
	const { body, metadata } = core.parse(
		`
---
title: Hello Parser
---

Welcome to the contents
		`.trim(),
	);

	assert.equal(metadata, {
		title: 'Hello Parser',
		estimate: 1,
		table: [],
	});

	assert.equal(body.trim(), 'Welcome to the contents');
});

Object.values(suites).forEach((v) => v.run());
