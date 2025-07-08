import { describe } from 'vitest';
import { parse, stringify } from './index.js';

describe('parse', ({ concurrent: it }) => {
	it('simple index', ({ expect }) => {
		const index = parse(
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
		const index = parse(
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
		const index = parse(
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
		const index = parse(
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
		const index = parse(
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
		const index = parse(
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
		const index = parse(
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
		const index = parse(
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
		expect(parse(`link:\r\n\tmal: abc\r\n\timdb:\r\n\t\t- abc\r\n\t\t- def`)).toEqual({
			link: { mal: 'abc', imdb: ['abc', 'def'] },
		});

		// with spaces
		expect(parse(`link:\r\n  mal: abc\r\n  imdb:\r\n    - abc\r\n    - def`)).toEqual({
			link: { mal: 'abc', imdb: ['abc', 'def'] },
		});
	});
	it('handle edge cases', ({ expect }) => {
		expect(
			parse(
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
			parse(
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
		const index = parse(
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

describe('stringify', ({ concurrent: it }) => {
	it('serializes flat object with primitives', ({ expect }) => {
		expect(stringify({ title: 'Hello World', published: true, count: null })).toBe(
			['title: Hello World', 'published: true', 'count: null'].join('\n'),
		);
	});

	it('serializes arrays of primitives', ({ expect }) => {
		expect(stringify({ tags: ['a', 'b', 'c'] })).toBe('tags: [a, b, c]');
	});

	it('serializes arrays of objects', ({ expect }) => {
		expect(stringify({ list: [{ foo: 'bar' }, { foo: 'baz' }] })).toBe(
			['list:', '  - foo: bar', '  - foo: baz'].join('\n'),
		);
		expect(stringify({ list: [{ foo: 'bar', bar: 'baz' }] })).toBe(
			['list:', '  - foo: bar', '    bar: baz'].join('\n'),
		);
	});

	it('serializes nested objects', ({ expect }) => {
		expect(stringify({ meta: { author: 'igna', draft: true } })).toBe(
			['meta:', '  author: igna', '  draft: true'].join('\n'),
		);
	});

	it('quotes strings with special characters', ({ expect }) => {
		expect(stringify({ title: 'a: b', note: ' needs quotes ' })).toBe(
			['title: "a: b"', 'note: " needs quotes "'].join('\n'),
		);
		expect(stringify({ text: 'say "hi"' })).toBe('text: "say \\"hi\\""');
		expect(stringify({ text: 'C:\\Users\\mauss' })).toBe('text: "C:\\\\Users\\\\mauss"');
	});

	it('serializes multiline strings as block literals', ({ expect }) => {
		expect(stringify({ note: 'line one\nline two\nline three' })).toBe(
			['note: |', '  line one', '  line two', '  line three'].join('\n'),
		);
	});

	it('serializes the review', ({ expect }) => {
		const review = {
			title: 'review title',
			genres: ['tag1', 'tag2'],
			alias: ['alias'],
			verdict: 'verdict',
			rating: { category: [{ type: '10' }] },
			seen: { first: 'date' },
			image: { en: 'link' },
			backdrop: 'link',
			link: { MyAnimeList: 'link' },
			soundtracks: [
				{ name: 'name', type: 'OP', artist: 'artist', youtube: 'id' },
				{ name: 'name', type: 'ED', artist: 'artist', youtube: 'id' },
			],
		};

		expect(stringify(review)).toBe(
			[
				'title: review title',
				'genres: [tag1, tag2]',
				'alias: [alias]',
				'verdict: verdict',
				'rating:',
				'  category:',
				'    - type: 10',
				'seen:',
				'  first: date',
				'image:',
				'  en: link',
				'backdrop: link',
				'link:',
				'  MyAnimeList: link',
				'soundtracks:',
				'  - name: name',
				'    type: OP',
				'    artist: artist',
				'    youtube: id',
				'  - name: name',
				'    type: ED',
				'    artist: artist',
				'    youtube: id',
			].join('\n'),
		);
	});
});
