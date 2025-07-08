import { describe } from 'vitest';
import { parse, stringify } from './index.js';

describe('parse', ({ concurrent: it }) => {
	it('simple index', ({ expect }) => {
		expect(parse(['title: Simple Index', 'tags: [x, y, z]'].join('\n'))).toEqual({
			title: 'Simple Index',
			tags: ['x', 'y', 'z'],
		});
	});

	it('aubade rules', ({ expect }) => {
		expect(
			parse(
				[
					'title: Aubade Rules',
					'date:published: 2023-02-01',
					'a:b:x: 0',
					'a:b:y: 1',
					'a:b:z: 2',
				].join('\n'),
			),
		).toEqual({
			title: 'Aubade Rules',
			date: { published: '2023-02-01' },
			a: { b: { x: '0', y: '1', z: '2' } },
		});
	});

	it('boolean values', ({ expect }) => {
		expect(
			parse(['title: Casting Boolean', 'draft: false', 'hex: ["x", true, 0, false]'].join('\n')),
		).toEqual({
			title: 'Casting Boolean',
			draft: false,
			hex: ['x', true, '0', false],
		});
	});

	it('literal block', ({ expect }) => {
		expect(
			parse(['title: Literal Block', 'data: |', '\tHello World', '\tLorem Ipsum'].join('\n')),
		).toEqual({
			title: 'Literal Block',
			data: 'Hello World\nLorem Ipsum',
		});
	});

	it('sequences', ({ expect }) => {
		expect(
			parse(['title: List Sequence', 'hex:', "\t- 'x'", '\t- true', '\t- 0'].join('\n')),
		).toEqual({
			title: 'List Sequence',
			hex: ['x', true, '0'],
		});
	});

	it('nested sequences', ({ expect }) => {
		expect(
			parse(
				[
					'title: Nested Sequences',
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
			title: 'Nested Sequences',
			colors: [
				{ red: ['ff0000', '255-0-0'], green: ['00ff00', '0-255-0'], blue: ['0000ff', '0-0-255'] },
				{ red: ['ff0000', '255-0-0'], green: ['00ff00', '0-255-0'], blue: ['0000ff', '0-0-255'] },
			],
		});
	});

	it('indents', ({ expect }) => {
		expect(
			parse(
				[
					'title: Indented Objects',
					'jobs:',
					'\ttest:',
					'\t\twith: node',
					'\t\tpath: ./test',
					'\tsync:',
					'\t\twith: pnpm',
				].join('\n'),
			),
		).toEqual({
			title: 'Indented Objects',
			jobs: {
				test: { with: 'node', path: './test' },
				sync: { with: 'pnpm' },
			},
		});
	});

	it('indented sequences', ({ expect }) => {
		expect(
			parse(
				[
					'title: Indented Objects and Arrays',
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
			title: 'Indented Objects and Arrays',
			jobs: {
				test: [{ with: 'node', os: 'windows' }],
				sync: [{ with: 'pnpm', os: 'linux', env: { TOKEN: '123' } }],
			},
		});
	});

	it('handle carriage returns', ({ expect }) => {
		expect(
			parse(['link:\r', '\tmal: abc\r', '\timdb:\r', '\t\t- abc\r', '\t\t- def'].join('\n')),
		).toEqual({
			link: { mal: 'abc', imdb: ['abc', 'def'] },
		});

		expect(
			parse(['link:\r', '  mal: abc\r', '  imdb:\r', '    - abc\r', '    - def'].join('\n')),
		).toEqual({
			link: { mal: 'abc', imdb: ['abc', 'def'] },
		});
	});

	it('handle edge cases', ({ expect }) => {
		expect(
			parse(
				[
					'title: Edge Cases',
					'empty:',
					'',
					'name: "Hello: World"',
					'link:',
					'\tnormal: https://github.com',
					'\tdashed:',
					'\t\t- https://myanimelist.net/anime/25537/Fate_stay_night_Movie__Heavens_Feel_-_I_Presage_Flower',
					'\t\t- https://myanimelist.net/anime/33049/Fate_stay_night_Movie__Heavens_Feel_-_II_Lost_Butterfly',
					'\t\t- https://myanimelist.net/anime/33050/Fate_stay_night_Movie__Heavens_Feel_-_III_Spring_Song',
				].join('\n'),
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

	it('construct with spaces indents', ({ expect }) => {
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
