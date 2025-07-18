import { describe } from 'vitest';
import { engrave, forge } from './index.js';

describe('spec', ({ concurrent: it }) => {
	// @WIP: 1-9

	// @MODIFIED: 10
	// @DISALLOWED: 11

	it.skip('#12', ({ expect }) => {
		const { tokens, html } = engrave(
			'\\!\\"\\#\\$\\%\\&\\\'\\(\\)\\*\\+\\,\\-\\.\\/\\:\\;\\<\\=\\>\\?\\@\\[\\\\\\]\\^\\_\\`\\{\\|\\}\\~',
		);

		expect(tokens[0]).toEqual({
			type: 'block:paragraph',
			children: [
				// { type: 'inline:escape', text: '!\"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~' },
				{ type: 'inline:escape', text: '!' },
				{ type: 'inline:escape', text: '"' },
				{ type: 'inline:escape', text: '#' },
				{ type: 'inline:escape', text: '$' },
				{ type: 'inline:escape', text: '%' },
				{ type: 'inline:escape', text: '&' },
				{ type: 'inline:escape', text: "'" },
				{ type: 'inline:escape', text: '(' },
				{ type: 'inline:escape', text: ')' },
				{ type: 'inline:escape', text: '*' },
				{ type: 'inline:escape', text: '+' },
				{ type: 'inline:escape', text: ',' },
				{ type: 'inline:escape', text: '-' },
				{ type: 'inline:escape', text: '.' },
				{ type: 'inline:escape', text: '/' }, // this fails with '\\/'
				{ type: 'inline:escape', text: ':' },
				{ type: 'inline:escape', text: ';' },
				{ type: 'inline:escape', text: '<' },
				{ type: 'inline:escape', text: '=' },
				{ type: 'inline:escape', text: '>' },
				{ type: 'inline:escape', text: '?' },
				{ type: 'inline:escape', text: '@' },
				{ type: 'inline:escape', text: '[' },
				{ type: 'inline:escape', text: '\\' },
				{ type: 'inline:escape', text: ']' },
				{ type: 'inline:escape', text: '^' },
				{ type: 'inline:escape', text: '_' }, // this fails with '\\_'
				{ type: 'inline:escape', text: '`' },
				{ type: 'inline:escape', text: '{' },
				{ type: 'inline:escape', text: '|' },
				{ type: 'inline:escape', text: '}' },
				{ type: 'inline:escape', text: '~' },
			],
		});
		// "<p>!&quot;#$%&amp;'()*+,-./:;&lt;=&gt;?@[]^_`{|}~</p>"

		// https://spec.commonmark.org/0.31.2/#example-12 - adjusted test
		expect(html()).toBe('<p>!&quot;#$%&amp;&#39;()*+,-./:;&lt;=&gt;?@[\\]^_`{|}~</p>');
	});

	it('#13', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-13
		expect(engrave('\\→\\A\\a\\ \\3\\φ\\«').html()).toBe('<p>\\→\\A\\a\\ \\3\\φ\\«</p>');
	});

	it('#14', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-14
		expect(
			engrave(
				[
					'\\*not emphasized*',
					'\\<br/> not a tag',
					'\\[not a link](/foo)',
					'\\`not code`',
					'1\\. not a list',
					'\\* not a list',
					'\\# not a heading',
					'\\[foo]: /url "not a reference"',
					'\\&ouml; not a character entity',
				].join('\n'),
			).html(),
		).toBe(
			[
				'<p>*not emphasized*',
				'&lt;br/&gt; not a tag',
				'[not a link](/foo)',
				'`not code`',
				'1. not a list',
				'* not a list',
				'# not a heading',
				'[foo]: /url &quot;not a reference&quot;',
				'&amp;ouml; not a character entity</p>',
			].join('\n'),
		);
	});

	it('#15', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-15
		expect(engrave('\\\\*emphasis*').html()).toBe('<p>\\<em>emphasis</em></p>');
	});

	// @MODIFIED: 16

	it('#17', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-17
		expect(engrave('`` \\[\\` ``').html()).toBe('<p><code>\\[\\`</code></p>');
	});

	// @DISALLOWED: 18
	// @DISALLOWED: 19

	it('#20', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-20
		expect(engrave('<https://example.com?find=\\*>').html()).toBe(
			'<p><a href="https://example.com?find=%5C*">https://example.com?find=\\*</a></p>',
		);
	});

	// @MODIFIED: 21

	it.todo('#22', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-22
		expect(engrave('[foo](/bar\\* "ti\\*tle")').html()).toBe(
			'<p><a href="/bar*" title="ti*tle">foo</a></p>',
		);
	});

	// @WIP: 23-41

	it.todo('#42', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-42
		expect(engrave('- `one\n- two`').html()).toBe('<ul><li>`one</li><li>two`</li></ul>');
	});

	it('#43', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-43
		expect(engrave('***').html()).toBe('<hr />');
		expect(engrave('---').html()).toBe('<hr />');
		expect(engrave('___').html()).toBe('<hr />');
		expect(engrave('***\n---\n___').html()).toBe('<hr />\n<hr />\n<hr />');
	});

	it('#44', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-44
		expect(engrave('+++').html()).toBe('<p>+++</p>');
	});

	it('#45', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-45
		expect(engrave('===').html()).toBe('<p>===</p>');
	});

	it('#46', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-46
		expect(engrave('**\n--\n__').html()).toBe('<p>**\n--\n__</p>');
	});

	it('#47', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-47
		expect(engrave([' ***', '  ***', '   ***'].join('\n')).html()).toBe('<hr />\n<hr />\n<hr />');
	});

	// @DISALLOWED: 48-49 [4 space indents code blocks]
	// @DISALLOWED: 50 [divider with more than 3 characters]
	// @DISALLOWED: 51-54 [divider with space and tabs between]

	it('#55', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-55
		expect(engrave([' ***', '  ***', '   ***'].join('\n')).html()).toBe('<hr />\n<hr />\n<hr />');
	});

	it('#56', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-56
		expect(engrave(' *-*').html()).toBe('<p><em>-</em></p>');
	});

	it.todo('#57', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-57
		expect(engrave(['- foo', '***', '- bar'].join('\n')).html()).toBe(
			'<ul><li>foo</li></ul><hr /><ul><li>bar</li></ul>',
		);
	});

	it('#58', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-58
		expect(engrave('foo\n***\nbar').html()).toBe('<p>foo</p>\n<hr />\n<p>bar</p>');
	});

	// @DISALLOWED: 59
	// @MODIFIED: 60-61
	// @MODIFIED: 62

	it('#63', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-63
		expect(engrave('####### foo').html()).toBe('<p>####### foo</p>');
	});

	it('#64', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-64
		expect(engrave('#5 bolt\n\n#hashtag').html()).toBe('<p>#5 bolt</p>\n<p>#hashtag</p>');
	});

	it('#65', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-65
		expect(engrave('\\## foo').html()).toBe('<p>## foo</p>');
	});

	// @MODIFIED: 66-67

	// @DISALLOWED: 80-106 [setext headings]

	it.todo('#149', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-149
		expect(
			engrave(`<table>
  <tr>
    <td>
           hi
    </td>
  </tr>
</table>

okay.`).html(),
		).toBe(
			`<table>
  <tr>
    <td>
           hi
    </td>
  </tr>
</table>
<p>okay.</p>`,
		);
	});

	it('#328', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-328
		expect(engrave('`code`').html()).toBe('<p><code>code</code></p>');
	});

	it('#329', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-329
		expect(engrave('`` code with `backticks ``').html()).toBe(
			'<p><code>code with `backticks</code></p>',
		);
	});

	it.todo('#330', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-330
		expect(engrave('` `` `').html()).toBe('<p><code>``</code></p>');
	});

	it('#341', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-341
		expect(engrave('*foo`*`').html()).toBe('<p>*foo<code>*</code></p>');
	});

	it('#342', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-342
		expect(engrave('[not a `link](/foo`)').html()).toBe('<p>[not a <code>link](/foo</code>)</p>');
	});

	it('#343', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-343
		expect(engrave('`<a href="`">`').html()).toBe(
			'<p><code>&lt;a href=&quot;</code>&quot;&gt;`</p>',
		);
	});

	it('#351', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-351
		expect(engrave('a * foo bar*').html()).toBe('<p>a * foo bar*</p>');
	});

	it('#352', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-352
		expect(engrave('a*"foo"*').html()).toBe('<p>a*&quot;foo&quot;*</p>');
	});

	it('#353', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-353
		expect(engrave('* a *').html()).toBe('<p>* a *</p>');
	});

	it('#354', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-354
		expect(engrave('*$*alpha.').html()).toBe('<p>*$*alpha.</p>');
		expect(engrave('*£*bravo.').html()).toBe('<p>*£*bravo.</p>');
		expect(engrave('*€*charlie.').html()).toBe('<p>*€*charlie.</p>');
	});

	it('#355', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-355
		expect(engrave('foo*bar*').html()).toBe('<p>foo<em>bar</em></p>');
	});

	it('#356', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-356
		expect(engrave('5*6*78').html()).toBe('<p>5<em>6</em>78</p>');
	});

	it('#358', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-358
		expect(engrave('_ foo bar_').html()).toBe('<p>_ foo bar_</p>');
	});

	it('#359', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-359
		expect(engrave('a_"foo"_').html()).toBe('<p>a_&quot;foo&quot;_</p>');
	});

	it('#360', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-360
		expect(engrave('foo_bar_').html()).toBe('<p>foo_bar_</p>');
	});

	it('#361', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-361
		expect(engrave('5_6_78').html()).toBe('<p>5_6_78</p>');
	});

	it('#362', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-362
		expect(engrave('пристаням_стремятся_').html()).toBe('<p>пристаням_стремятся_</p>');
	});

	it('#363', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-363
		expect(engrave('aa_"bb"_cc').html()).toBe('<p>aa_&quot;bb&quot;_cc</p>');
	});

	it('#364', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-364
		expect(engrave('foo-_(bar)_').html()).toBe('<p>foo-<em>(bar)</em></p>');
	});

	it('#365', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-365
		expect(engrave('_foo*').html()).toBe('<p>_foo*</p>');
	});

	it('#366', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-366
		expect(engrave('*foo bar *').html()).toBe('<p>*foo bar *</p>');
	});

	it('#367', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-367
		expect(engrave('*foo bar\n*').html()).toBe('<p>*foo bar\n*</p>');
	});

	it('#368', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-368
		expect(engrave('*(*foo)').html()).toBe('<p>*(*foo)</p>');
	});

	it('#369', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-369
		expect(engrave('*(*foo*)*').html()).toBe('<p><em>(<em>foo</em>)</em></p>');
	});

	it('#370', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-370
		expect(engrave('*foo*bar').html()).toBe('<p><em>foo</em>bar</p>');
	});

	it('#371', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-371
		expect(engrave('_foo bar _').html()).toBe('<p>_foo bar _</p>');
	});

	it('#372', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-372
		expect(engrave('_(_foo)').html()).toBe('<p>_(_foo)</p>');
	});

	it('#373', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-373
		expect(engrave('_(_foo_)_').html()).toBe('<p><em>(<em>foo</em>)</em></p>');
	});

	it('#374', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-374
		expect(engrave('_foo_bar').html()).toBe('<p>_foo_bar</p>');
	});

	it('#375', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-375
		expect(engrave('_пристаням_стремятся').html()).toBe('<p>_пристаням_стремятся</p>');
	});

	it('#376', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-376
		expect(engrave('_foo_bar_baz_').html()).toBe('<p><em>foo_bar_baz</em></p>');
	});

	it('#377', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-377
		expect(engrave('_(bar)_.').html()).toBe('<p><em>(bar)</em>.</p>');
	});

	it('#378', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-378
		expect(engrave('**foo bar**').html()).toBe('<p><strong>foo bar</strong></p>');
	});

	it('#379', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-379
		expect(engrave('** foo bar**').html()).toBe('<p>** foo bar**</p>');
	});

	it('#380', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-380
		expect(engrave('a**"foo"**').html()).toBe('<p>a**&quot;foo&quot;**</p>');
	});

	it('#381', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-381
		expect(engrave('foo**bar**').html()).toBe('<p>foo<strong>bar</strong></p>');
	});

	// 382-390 is N/A

	it('#391', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-391
		expect(engrave('**foo bar **').html()).toBe('<p>**foo bar **</p>');
	});

	it('#392', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-392
		expect(engrave('**(**foo)').html()).toBe('<p>**(**foo)</p>');
	});

	it('#393', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-393
		expect(engrave('*(**foo**)*').html()).toBe('<p><em>(<strong>foo</strong>)</em></p>');
	});

	it.todo('#394', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-394
		expect(
			engrave('**Gomphocarpus (*Gomphocarpus physocarpus*, syn.\n*Asclepias physocarpa*)**').html(),
		).toBe(
			'<p><strong>Gomphocarpus (<em>Gomphocarpus physocarpus</em>, syn.\n<em>Asclepias physocarpa</em>)</strong></p>',
		);
	});

	it('#482', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-482
		expect(engrave('[link](/uri "title")').html(), '<p><a href="/uri" title="title">link</a></p>');
	});
});

describe('@MODIFIED', ({ concurrent: it }) => {
	it('#10', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-10
		expect(engrave('#\tFoo').html()).toBe('<h1 id="foo">Foo</h1>');
	});

	it('#16 | inline break is `\n` instead of `<br />`', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-16
		expect(engrave('foo\\\nbar').html()).toBe('<p>foo\nbar</p>');

		const modified = forge({
			renderer: { 'inline:break': () => '<br />' },
		});
		expect(modified('foo\\\nbar').tokens[0]).toEqual({
			type: 'block:paragraph',
			children: [
				{ type: 'inline:text', text: 'foo' },
				{ type: 'inline:break' },
				{ type: 'inline:text', text: 'bar' },
			],
		});
		expect(modified('foo\\\nbar').html()).toBe('<p>foo<br />bar</p>');
	});

	it('#21 | HTML tag needs to be closed', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-21
		expect(engrave('<a href="/bar\\/)"></a>').html()).toBe('<a href="/bar\\/)"></a>');
	});

	it('#62 | ATX headings includes and inherits id', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-62
		expect(
			engrave(
				['# foo', '## foo', '### foo', '#### foo', '##### foo', '###### foo'].join('\n'),
			).html(),
		).toBe(
			[
				'<h1 id="foo">foo</h1>',
				`<h2 id="${Array(2).fill('foo').join('-')}">foo</h2>`,
				`<h3 id="${Array(3).fill('foo').join('-')}">foo</h3>`,
				`<h4 id="${Array(4).fill('foo').join('-')}">foo</h4>`,
				`<h5 id="${Array(5).fill('foo').join('-')}">foo</h5>`,
				`<h6 id="${Array(6).fill('foo').join('-')}">foo</h6>`,
			].join('\n'),
		);
	});

	it.todo('#66', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-66
		expect(engrave('# foo *bar* \\*baz\\*').html()).toBe(
			'<h1 id="foo-bar-baz">foo <em>bar</em> *baz*</h1>',
		);
	});

	it('#67', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-67
		expect(engrave('#                  foo                     ').html()).toBe(
			'<h1 id="foo">foo</h1>',
		);
	});
});

describe('@DISALLOWED', ({ concurrent: it }) => {
	it('#11 | no space between identifiers', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-11
		expect(engrave('*\t*\t*\t').html()).toBe('<p>*\t*\t*</p>');
	});

	it('#18 | 4 (any) space indent is just a paragraph', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-18
		expect(engrave('    \[\]').html()).toBe('<p>\[\]</p>');
	});

	it.todo('#19 | only triple backticks code block', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-18
		expect(engrave('~~~\n\[\]\n~~~').html()).toBe('<p>~~~\n\[\]\n~~~</p>');
	});

	it('#59 | triple dash does not make a heading', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-59
		expect(engrave('Foo\n---\nbar').html()).toBe('<p>Foo</p>\n<hr />\n<p>bar</p>');
	});
});
