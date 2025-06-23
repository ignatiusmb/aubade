import { describe } from 'vitest';
import { matter } from './index.js';

describe('matter', ({ concurrent: it }) => {
	it('simple index', ({ expect }) => {
		const index = matter(
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
		const index = matter(
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
		const index = matter(
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
		const index = matter(
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
		const index = matter(
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
		const index = matter(
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
		const index = matter(
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
		const index = matter(
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
		expect(matter(`link:\r\n\tmal: abc\r\n\timdb:\r\n\t\t- abc\r\n\t\t- def`)).toEqual({
			link: { mal: 'abc', imdb: ['abc', 'def'] },
		});

		// with spaces
		expect(matter(`link:\r\n  mal: abc\r\n  imdb:\r\n    - abc\r\n    - def`)).toEqual({
			link: { mal: 'abc', imdb: ['abc', 'def'] },
		});
	});
	it('handle edge cases', ({ expect }) => {
		expect(
			matter(
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
			matter(
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
		const index = matter(
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
});
