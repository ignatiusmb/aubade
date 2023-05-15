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
		path: ./test
	sync:
		with: pnpm
		`.trim()
	);

	assert.equal(index, {
		title: 'Indented Objects',
		jobs: {
			test: { with: 'node', path: './test' },
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
basics.construct('handle carriage returns', () => {
	// with tabs
	assert.equal(core.construct(`link:\r\n\tmal: abc\r\n\timdb:\r\n\t\t- abc\r\n\t\t- def`), {
		link: { mal: 'abc', imdb: ['abc', 'def'] },
	});

	// with spaces
	assert.equal(core.construct(`link:\r\n  mal: abc\r\n  imdb:\r\n    - abc\r\n    - def`), {
		link: { mal: 'abc', imdb: ['abc', 'def'] },
	});
});
basics.construct('handle edge cases', () => {
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
			`.trim()
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
		}
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
			`.trim()
		),
		{
			trailing: ['tab'],
			invisible: ['trailing space'],
			multiple: ['tabs'],
			voyager: ['multiple space'],
		}
	);
});
basics.construct('construct with spaces indents', () => {
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
    `.trim()
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
