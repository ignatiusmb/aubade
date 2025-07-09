import { describe } from 'vitest';
import { parse, stringify } from './index.js';

describe('parse', ({ concurrent: it }) => {
	it('flat key-values', ({ expect }) => {
		expect(parse('title: Simple Index')).toEqual({
			title: 'Simple Index',
		});
	});

	it('string with special characters', ({ expect }) => {
		expect(parse('date: "2025-07-09T14:55:10+07:00"')).toEqual({
			date: '2025-07-09T14:55:10+07:00',
		});
	});

	it('boolean and null', ({ expect }) => {
		expect(parse('draft: false')).toEqual({
			draft: false,
		});
		expect(parse('draft: true')).toEqual({
			draft: true,
		});
		expect(parse('draft: null')).toEqual({
			draft: null,
		});
	});

	it('inline arrays', ({ expect }) => {
		expect(parse('tags: [x, y, z]')).toEqual({
			tags: ['x', 'y', 'z'],
		});
	});

	it('inline arrays | mixed-types', ({ expect }) => {
		expect(parse('hex: ["x", true, 0, false]')).toEqual({
			hex: ['x', true, '0', false],
		});
	});

	it('inline arrays | mixed quoted and unquoted strings', ({ expect }) => {
		expect(parse('alias: [Re ZERO, "Re:ZERO - Memory Snow"]')).toEqual({
			alias: ['Re ZERO', 'Re:ZERO - Memory Snow'],
		});
	});

	it('inline arrays | string with special characters', ({ expect }) => {
		expect(parse('alias: ["Kaguya-sama: Love is War"]')).toEqual({
			alias: ['Kaguya-sama: Love is War'],
		});
		expect(parse('alias: [first thing, "Hello, World", third]')).toEqual({
			alias: ['first thing', 'Hello, World', 'third'],
		});
	});

	it('nested objects', ({ expect }) => {
		expect(parse('a:b:c: 1')).toEqual({
			a: { b: { c: '1' } },
		});
	});

	it('deeply nested keys', ({ expect }) => {
		expect(
			parse(['date:updated: 2023-02-01', 'a:b:x: 0', 'a:b:y: 1', 'a:b:z: 2'].join('\n')),
		).toEqual({
			date: { updated: '2023-02-01' },
			a: { b: { x: '0', y: '1', z: '2' } },
		});
	});

	it('block | literal scalars with `|` syntax', ({ expect }) => {
		expect(
			parse(
				[
					'data: |', //
					'\tHello World',
					'\tLorem Ipsum',
				].join('\n'),
			),
		).toEqual({
			data: 'Hello World\nLorem Ipsum',
		});
	});

	it('block | sequence of scalars', ({ expect }) => {
		expect(
			parse(
				[
					'values:',
					"\t- 'x'",
					'\t- true',
					'\t- 0',
					'something:',
					'\t- random',
					'\t- ', // empty
					'\t- 1',
				].join('\n'),
			),
		).toEqual({
			values: ['x', true, '0'],
			something: ['random', '', '1'],
		});
	});

	it('block | sequence of objects', ({ expect }) => {
		expect(
			parse(
				[
					'colors:',
					'\t- red: ff0000',
					'\t  green: 00ff00',
					'\t  blue: 0000ff',
					'\t- red: 255-0-0',
					'\t  green: 0-255-0',
					'\t  blue: 0-0-255',
				].join('\n'),
			),
		).toEqual({
			colors: [
				{ red: 'ff0000', green: '00ff00', blue: '0000ff' },
				{ red: '255-0-0', green: '0-255-0', blue: '0-0-255' },
			],
		});
	});

	it('block | nested sequences inside object entries', ({ expect }) => {
		expect(
			parse(
				[
					'colors:',
					'\t- red:',
					'\t\t\t- ff0000',
					'\t\t\t- 255-0-0',
					'\t\tgreen:',
					'\t\t\t- 00ff00',
					'\t\t\t- 0-255-0',
					'\t\tblue:',
					'\t\t\t- 0000ff',
					'\t\t\t- 0-0-255',
					'\t- red:',
					'\t\t\t- ff0000',
					'\t\t\t- 255-0-0',
					'\t\tgreen:',
					'\t\t\t- 00ff00',
					'\t\t\t- 0-255-0',
					'\t\tblue:',
					'\t\t\t- 0000ff',
					'\t\t\t- 0-0-255',
				].join('\n'),
			),
		).toEqual({
			colors: [
				{ red: ['ff0000', '255-0-0'], green: ['00ff00', '0-255-0'], blue: ['0000ff', '0-0-255'] },
				{ red: ['ff0000', '255-0-0'], green: ['00ff00', '0-255-0'], blue: ['0000ff', '0-0-255'] },
			],
		});
	});

	it('block | nested objects with indentation', ({ expect }) => {
		expect(
			parse(
				[
					'jobs:',
					'\ttest:',
					'\t\twith: node',
					'\t\tpath: ./test',
					'\tsync:',
					'\t\twith: pnpm',
				].join('\n'),
			),
		).toEqual({
			jobs: {
				test: { with: 'node', path: './test' },
				sync: { with: 'pnpm' },
			},
		});
	});

	it('block | deeply nested sequences of objects', ({ expect }) => {
		expect(
			parse(
				[
					'jobs:',
					'\ttest:',
					'\t\t- with: node',
					'\t\t\tos: windows',
					'\tsync:',
					'\t\t- with: pnpm',
					'\t\t\tos: linux',
					'\t\t\tenv:',
					'\t\t\t\tTOKEN: 123',
				].join('\n'),
			),
		).toEqual({
			jobs: {
				test: [{ with: 'node', os: 'windows' }],
				sync: [{ with: 'pnpm', os: 'linux', env: { TOKEN: '123' } }],
			},
		});
	});

	it('empty value, empty line, and quoted entries, URL entries', ({ expect }) => {
		expect(parse(['empty:', '', 'name: "Hello: World"'].join('\n'))).toEqual({
			empty: '',
			name: 'Hello: World',
		});
	});

	it('carriage returns', ({ expect }) => {
		expect(
			parse(
				[
					'link:\r', //
					'\tmal: abc\r',
					'\timdb:\r',
					'\t\t- abc\r',
					'\t\t- def',
				].join('\n'),
			),
		).toEqual({
			link: { mal: 'abc', imdb: ['abc', 'def'] },
		});

		expect(
			parse(
				[
					'link:\r', //
					'  mal: abc\r',
					'  imdb:\r',
					'    - abc\r',
					'    - def',
				].join('\n'),
			),
		).toEqual({
			link: { mal: 'abc', imdb: ['abc', 'def'] },
		});
	});

	it('nested URL entries', ({ expect }) => {
		expect(
			parse(
				[
					'link:',
					'\tnormal: https://github.com',
					'\tdashed:',
					'\t\t- https://myanimelist.net/anime/25537/Fate_stay_night_Movie__Heavens_Feel_-_I_Presage_Flower',
					'\t\t- https://myanimelist.net/anime/33049/Fate_stay_night_Movie__Heavens_Feel_-_II_Lost_Butterfly',
					'\t\t- https://myanimelist.net/anime/33050/Fate_stay_night_Movie__Heavens_Feel_-_III_Spring_Song',
				].join('\n'),
			),
		).toEqual({
			link: {
				normal: 'https://github.com',
				dashed: [
					'https://myanimelist.net/anime/25537/Fate_stay_night_Movie__Heavens_Feel_-_I_Presage_Flower',
					'https://myanimelist.net/anime/33049/Fate_stay_night_Movie__Heavens_Feel_-_II_Lost_Butterfly',
					'https://myanimelist.net/anime/33050/Fate_stay_night_Movie__Heavens_Feel_-_III_Spring_Song',
				],
			},
		});
	});

	it('trailing tabs/spaces', ({ expect }) => {
		expect(
			parse(
				[
					'trailing:\t',
					'\t- tab',
					'invisible: ',
					'\t- trailing space',
					'multiple:\t\t\t',
					'\t- tabs',
					'voyager:   ',
					'\t- multiple space',
				].join('\n'),
			),
		).toEqual({
			trailing: ['tab'],
			invisible: ['trailing space'],
			multiple: ['tabs'],
			voyager: ['multiple space'],
		});
	});

	it('spaces indentations', ({ expect }) => {
		expect(
			parse(
				[
					'jobs:',
					'  test:',
					'    with: node',
					'    path: ./test',
					'    cache:',
					'      - ./.cache',
					'      - ~/.cache',
					'      - /tmp/cache',
					'  sync:',
					'    - with: npm',
					'      os: linux',
					'    - with: pnpm',
					'      os: windows',
					'',
					'link:',
					'  github: https://github.com',
					'  youtube: https://youtube.com',
					'  search-engines:',
					'    - https://duckduckgo.com',
					'    - https://google.com',
					'    - https://bing.com',
				].join('\n'),
			),
		).toEqual({
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
	it('flat object with primitives', ({ expect }) => {
		expect(stringify({ title: 'Hello World', published: true, count: null })).toBe(
			['title: Hello World', 'published: true', 'count: null'].join('\n'),
		);
	});

	it('arrays of primitives', ({ expect }) => {
		expect(stringify({ tags: ['a', 'b', 'c'] })).toBe('tags: [a, b, c]');
	});

	it('arrays of objects', ({ expect }) => {
		expect(stringify({ list: [{ foo: 'bar' }, { foo: 'baz' }] })).toBe(
			['list:', '  - foo: bar', '  - foo: baz'].join('\n'),
		);
		expect(stringify({ list: [{ foo: 'bar', bar: 'baz' }] })).toBe(
			['list:', '  - foo: bar', '    bar: baz'].join('\n'),
		);
	});

	it('nested objects', ({ expect }) => {
		expect(stringify({ meta: { author: 'igna', draft: true } })).toBe(
			['meta:', '  author: igna', '  draft: true'].join('\n'),
		);
	});

	it('quotes strings with special characters', ({ expect }) => {
		expect(stringify({ title: 'a: b', note: ' trimmed ' })).toBe(
			['title: "a: b"', 'note: trimmed'].join('\n'),
		);
		expect(stringify({ text: 'say "hi"' })).toBe('text: "say \\"hi\\""');
		expect(stringify({ text: 'C:\\Users\\mauss' })).toBe('text: "C:\\\\Users\\\\mauss"');
	});

	it('multiline strings as block literals', ({ expect }) => {
		expect(stringify({ note: 'line one\nline two\nline three' })).toBe(
			['note: |', '  line one', '  line two', '  line three'].join('\n'),
		);
	});

	it('example | the review', ({ expect }) => {
		const review = {
			title: 'review title',
			genres: ['tag1', 'tag2'],
			alias: ['something: foo-bar'],
			verdict: 'verdict',
			rating: { category: [{ type: '10' }] },
			seen: { first: 'date' },
			image: { en: 'link' },
			backdrop: 'https://www.themoviedb.org',
			link: { MyAnimeList: 'https://myanimelist.net/anime' },
			soundtracks: [
				{ name: 'name', type: 'OP', artist: 'artist', youtube: 'id' },
				{ name: 'name', type: 'ED', artist: 'artist', youtube: 'id' },
			],
		};

		expect(stringify(review)).toBe(
			[
				'title: review title',
				'genres: [tag1, tag2]',
				'alias: ["something: foo-bar"]',
				'verdict: verdict',
				'rating:',
				'  category:',
				'    - type: 10',
				'seen:',
				'  first: date',
				'image:',
				'  en: link',
				'backdrop: https://www.themoviedb.org',
				'link:',
				'  MyAnimeList: https://myanimelist.net/anime',
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
