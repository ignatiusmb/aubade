import { describe } from 'vitest';
import * as core from './index.js';

describe('construct', ({ concurrent: it }) => {
	it('simple index', ({ expect }) => {
		const index = core.construct(
			`
title: Simple Index
tags: [x, y, z]
		`.trim(),
		);

		expect(index).toEqual({
			title: 'Simple Index',
			tags: ['x', 'y', 'z'],
		});
	});

	it('aubade rules', ({ expect }) => {
		const index = core.construct(
			`
title: Aubade Rules
date:published: 2023-02-01
a:b:x: 0
a:b:y: 1
a:b:z: 2
		`.trim(),
		);

		expect(index).toEqual({
			title: 'Aubade Rules',
			date: { published: '2023-02-01' },
			a: { b: { x: '0', y: '1', z: '2' } },
		});
	});

	it('boolean values', ({ expect }) => {
		const index = core.construct(
			`
title: Casting Boolean
draft: false
hex: ["x", true, 0, false]
		`.trim(),
		);

		expect(index).toEqual({
			title: 'Casting Boolean',
			draft: false,
			hex: ['x', true, '0', false],
		});
	});

	it('literal block', ({ expect }) => {
		const index = core.construct(
			`
title: Literal Block
data: |
	Hello World
	Lorem Ipsum
		`.trim(),
		);

		expect(index).toEqual({
			title: 'Literal Block',
			data: 'Hello World\nLorem Ipsum',
		});
	});
	it('sequences', ({ expect }) => {
		const index = core.construct(
			`
title: List Sequence
hex:
	- 'x'
	- true
	- 0
		`.trim(),
		);

		expect(index).toEqual({
			title: 'List Sequence',
			hex: ['x', true, '0'],
		});
	});
	it('nested sequences', ({ expect }) => {
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

		expect(index).toEqual({
			title: 'Nested Sequences',
			colors: [
				{ red: ['ff0000', '255-0-0'], green: ['00ff00', '0-255-0'], blue: ['0000ff', '0-0-255'] },
				{ red: ['ff0000', '255-0-0'], green: ['00ff00', '0-255-0'], blue: ['0000ff', '0-0-255'] },
			],
		});
	});
	it('indents', ({ expect }) => {
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

		expect(index).toEqual({
			title: 'Indented Objects',
			jobs: {
				test: { with: 'node', path: './test' },
				sync: { with: 'pnpm' },
			},
		});
	});
	it('indented sequences', ({ expect }) => {
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

		expect(index).toEqual({
			title: 'Indented Objects and Arrays',
			jobs: {
				test: [{ with: 'node', os: 'windows' }],
				sync: [{ with: 'pnpm', os: 'linux', env: { TOKEN: '123' } }],
			},
		});
	});
	it('handle carriage returns', ({ expect }) => {
		// with tabs
		expect(core.construct(`link:\r\n\tmal: abc\r\n\timdb:\r\n\t\t- abc\r\n\t\t- def`)).toEqual({
			link: { mal: 'abc', imdb: ['abc', 'def'] },
		});

		// with spaces
		expect(core.construct(`link:\r\n  mal: abc\r\n  imdb:\r\n    - abc\r\n    - def`)).toEqual({
			link: { mal: 'abc', imdb: ['abc', 'def'] },
		});
	});
	it('handle edge cases', ({ expect }) => {
		expect(
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
		).toEqual({
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
		});

		expect(
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
		).toEqual({
			trailing: ['tab'],
			invisible: ['trailing space'],
			multiple: ['tabs'],
			voyager: ['multiple space'],
		});
	});
	it('construct with spaces indents', ({ expect }) => {
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

		expect(index).toEqual({
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

	describe('.table', ({ concurrent: it }) => {
		it('generate hash from delimited heading', ({ expect }) => {
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

			expect(metadata.table).toEqual([
				{
					id: 'story-plot',
					level: 2,
					title: '8/10 | story & plot',
				},
			]);
		});
		it('fill sections as expected', ({ expect }) => {
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

			expect(metadata.table[0]).toEqual({
				id: 'simple-heading',
				level: 2,
				title: 'simple heading',
			});
			expect(metadata.table[1]).toEqual({
				id: 'story-plot',
				level: 2,
				title: 'story & plot',
			});
			expect(metadata.table[2]).toEqual({
				id: 'story-plot-sub-story',
				level: 3,
				title: 'sub-story',
			});
			expect(metadata.table[3]).toEqual({
				id: 'story-plot-sub-story-smallest-heading',
				level: 4,
				title: 'smallest heading',
			});
			expect(metadata.table[4]).toEqual({
				id: 'story-plot-sub-plot',
				level: 3,
				title: 'sub-plot',
			});
		});
		it('trim comments correctly', ({ expect }) => {
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

			expect(metadata.table.length).toEqual(4);
		});
	});
});

describe('parse', ({ concurrent: it }) => {
	it('markdown file', ({ expect }) => {
		const { body, metadata } = core.parse(
			`
---
title: Hello Parser
---

Welcome to the contents
		`.trim(),
		);

		expect(metadata).toEqual({
			title: 'Hello Parser',
			estimate: 1,
			table: [],
		});

		expect(body.trim(), 'Welcome to the contents');
	});
});
