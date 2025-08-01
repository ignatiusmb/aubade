import { describe } from 'vitest';
import { engrave, forge } from './index.js';

// NOTES:
// - output is exactly the same as the spec, except for the following:
// - @DIS -> output is completely different from the spec
// - @MOD -> output is enhanced from the spec, slightly different
describe('spec', ({ concurrent: it }) => {
	it('#1 | @DIS: no tab indent code blocks', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-1
		expect(engrave('\tfoo\tbaz\t\tbim').html()).toBe('<p>foo\tbaz\t\tbim</p>');
	});

	it('#2 | @DIS: no mixed space indent code blocks', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-2
		expect(engrave('  \tfoo\tbaz\t\tbim').html()).toBe('<p>foo\tbaz\t\tbim</p>');
	});

	it('#3 | @DIS: no 4 space indent code blocks', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-3
		expect(engrave('    a\ta\n    ὐ\ta').html()).toBe('<p>a\ta\nὐ\ta</p>');
	});

	it.todo('#4', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-4
		expect(engrave('  - foo\n\n\tbar').html()).toBe(
			'<ul>\n<li>\n<p>foo</p>\n<p>bar</p>\n</li>\n</ul>',
		);
	});

	it.todo('#5 | @DIS: no tab indent code blocks in list item', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-5
		expect(engrave('- foo\n\n\t\tbar').html()).toBe(
			'<ul>\n<li>\n<p>foo</p>\n<p>bar</p>\n</li>\n</ul>',
		);
	});

	it('#6 | @DIS: no tab indent code blocks in blockquote', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-6
		expect(engrave('>\t\tfoo').html()).toBe('<blockquote><p>foo</p></blockquote>');
	});

	it.todo('#7 | @DIS: no tab indent code blocks in list item', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-7
		expect(engrave('-\t\tfoo').html()).toBe('<ul><li><p>foo</p></li></ul>');
	});

	it('#8 | @DIS: no mixed space indent code blocks', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-8
		expect(engrave('    foo\n\tbar').html()).toBe('<p>foo\nbar</p>');
	});

	it.todo('#9', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-9
		expect(engrave(' - foo\n   - bar\n\t - baz').html()).toBe(
			[
				'<ul>',
				'<li>foo',
				'<ul>',
				'<li>bar',
				'<ul>',
				'<li>baz</li>',
				'</ul>',
				'</li>',
				'</ul>',
				'</li>',
				'</ul>',
			].join('\n'),
		);
	});

	it('#10 | @MOD: enhanced heading with attributes', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-10
		expect(engrave('#\tFoo').html()).toBe('<h1 id="foo" data-text="Foo">Foo</h1>');
	});

	it('#11 | @DIS: no space between identifiers', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-11
		expect(engrave('*\t*\t*\t').html()).toBe('<p>*\t*\t*</p>');
	});

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

	it("#16 | @MOD: inline break is '\\n' instead of '<br />'", ({ expect }) => {
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

	it('#17', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-17
		expect(engrave('`` \\[\\` ``').html()).toBe('<p><code>\\[\\`</code></p>');
	});

	it('#18 | @DIS: any space indent is just a paragraph', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-18
		expect(engrave('    \[\]').html()).toBe('<p>\[\]</p>');
	});

	it.todo('#19 | @DIS: only triple backticks code block', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-19
		expect(engrave('~~~\n\[\]\n~~~').html()).toBe('<p>~~~\n\[\]\n~~~</p>');
	});

	it('#20', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-20
		expect(engrave('<https://example.com?find=\\*>').html()).toBe(
			'<p><a href="https://example.com?find=%5C*">https://example.com?find=\\*</a></p>',
		);
	});

	it('#21 | @MOD: HTML tag needs to be closed', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-21
		expect(engrave('<a href="/bar\\/)"></a>').html()).toBe('<a href="/bar\\/)"></a>');
	});

	it.todo('#22', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-22
		expect(engrave('[foo](/bar\\* "ti\\*tle")').html()).toBe(
			'<p><a href="/bar*" title="ti*tle">foo</a></p>',
		);
	});

	it.skip('#23', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-23
		expect(engrave('[foo]\n\n[foo]: /bar\\* "ti\\*tle"').html()).toBe(
			'<p><a href="/bar*" title="ti*tle">foo</a></p>',
		);
	});

	it("#24 | @MOD: code blocks with 'data-language'", ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-24
		expect(engrave('``` foo\+bar\nfoo\n```').html()).toBe(
			'<pre data-language="foo+bar"><code>foo</code></pre>',
		);
	});

	// @WIP: 23-41

	it('#25 | @MOD: HTML5 entities are left as-is', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-25
		expect(
			engrave(
				[
					'&nbsp; &amp; &copy; &AElig; &Dcaron;',
					'&frac34; &HilbertSpace; &DifferentialD;',
					'&ClockwiseContourIntegral; &ngE;',
				].join('\n'),
			).html(),
		).toBe(
			[
				'<p>&nbsp; &amp; &copy; &AElig; &Dcaron;',
				'&frac34; &HilbertSpace; &DifferentialD;',
				'&ClockwiseContourIntegral; &ngE;</p>',
			].join('\n'),
		);
	});

	it('#26 | @MOD: decimal numeric characters are left as-is', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-26
		expect(engrave('&#35; &#1234; &#992; &#0;').html()).toBe('<p>&#35; &#1234; &#992; &#0;</p>');
	});

	it.todo('#27 | @MOD: hexadecimal numeric characters are left as-is', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-27
		expect(engrave('&#X22; &#XD06; &#xcab;').html()).toBe('<p>&#X22; &#XD06; &#xcab;</p>');
	});

	it.todo('#28', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-28
		expect(
			engrave(
				['&nbsp &x; &#; &#x;', '&#87654321;', '&#abcdef0;', '&ThisIsNotDefined; &hi?;'].join('\n'),
			).html(),
		).toBe(
			[
				'<p>&amp;nbsp &amp;x; &amp;#; &amp;#x;',
				'&amp;#87654321;',
				'&amp;#abcdef0;',
				'&amp;ThisIsNotDefined; &amp;hi?;</p>',
			].join('\n'),
		);
	});

	it('#29', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-29
		expect(engrave('&copy').html()).toBe('<p>&amp;copy</p>');
	});

	it.todo('#30', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-30
		expect(engrave('&MadeUpEntity;').html()).toBe('<p>&amp;MadeUpEntity;</p>');
	});

	it('#31 | @MOD: close HTML tag', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-31
		expect(engrave('<a href="&ouml;&ouml;.html"></a>').html()).toBe(
			'<a href="&ouml;&ouml;.html"></a>',
		);
	});

	it.todo('#32', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-32
		expect(engrave('[foo](/f&ouml;&ouml; "f&ouml;&ouml;")').html()).toBe(
			'<p><a href="/f%C3%B6%C3%B6" title="föö">foo</a></p>',
		);
	});

	it.skip('#33', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-33
		expect(engrave('[foo]\n\n[foo]: /f&ouml;&ouml; "f&ouml;&ouml;"').html()).toBe(
			'<p><a href="/f%C3%B6%C3%B6" title="föö">foo</a></p>',
		);
	});

	it.skip("#34 | @MOD: code blocks with 'data-language'", ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-34
		expect(engrave('``` f&ouml;&ouml;\nfoo\n```').html()).toBe(
			'<pre data-language="föö"><code>foo</code></pre>',
		);
	});

	it.todo('#35', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-35
		expect(engrave('').html()).toBe('');
	});

	it.todo('#36', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-36
		expect(engrave('').html()).toBe('');
	});

	it.todo('#37', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-37
		expect(engrave('').html()).toBe('');
	});

	it.todo('#38', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-38
		expect(engrave('').html()).toBe('');
	});

	it.todo('#39', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-39
		expect(engrave('').html()).toBe('');
	});

	it.todo('#40', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-40
		expect(engrave('').html()).toBe('');
	});

	it.todo('#41', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-41
		expect(engrave('').html()).toBe('');
	});

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

	it('#48 | @DIS: no 4 space indent code blocks', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-48
		expect(engrave('    ***').html()).toBe('<hr />');
	});

	it('#49 | @DIS: no 4 space indent code blocks', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-49
		expect(engrave('Foo\n    ***').html()).toBe('<p>Foo</p>\n<hr />');
	});

	it('#50 | @DIS: divider needs to be 3 characters', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-50
		expect(engrave('_____________________________________').html()).toBe(
			'<p>_____________________________________</p>',
		);
	});

	it('#51 | @DIS: no spaces or tabs between', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-51
		expect(engrave(' - - -').html()).toBe('<p>- - -</p>');
	});

	it('#52 | @DIS: no spaces or tabs between', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-52
		expect(engrave(' **  * ** * ** * **').html()).toBe('<p>**  * ** * ** * **</p>');
	});

	it('#53 | @DIS: no spaces or tabs between', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-53
		expect(engrave('-     -      -      -').html()).toBe('<p>-     -      -      -</p>');
	});

	it('#54 | @MOD: spaces only at the end', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-54
		expect(engrave('---    ').html()).toBe('<hr />');
	});

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

	it('#59 | @DIS: triple dash does not make a heading', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-59
		expect(engrave('Foo\n---\nbar').html()).toBe('<p>Foo</p>\n<hr />\n<p>bar</p>');
	});

	it.todo('#60 | @DIS: divider and list item', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-60
		expect(engrave('* Foo\n* * *\n* Bar').html()).toBe(
			['<ul>', '<li>Foo</li>', '<li>* *</li>', '<li>Bar</li>', '</ul>'].join('\n'),
		);
	});

	it.todo('#61 | @MOD: divider in list item', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-61
		expect(engrave('- Foo\n- ***').html()).toBe(
			['<ul>', '<li>Foo</li>', '<li>', '<hr />', '</li>', '</ul>'].join('\n'),
		);
	});

	it('#62 | @MOD: ATX headings with attributes', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-62
		expect(
			engrave(
				['# foo', '## foo', '### foo', '#### foo', '##### foo', '###### foo'].join('\n'),
			).html(),
		).toBe(
			[
				'<h1 id="foo" data-text="foo">foo</h1>',
				`<h2 id="${Array(2).fill('foo').join('-')}" data-text="foo">foo</h2>`,
				`<h3 id="${Array(3).fill('foo').join('-')}" data-text="foo">foo</h3>`,
				`<h4 id="${Array(4).fill('foo').join('-')}" data-text="foo">foo</h4>`,
				`<h5 id="${Array(5).fill('foo').join('-')}" data-text="foo">foo</h5>`,
				`<h6 id="${Array(6).fill('foo').join('-')}" data-text="foo">foo</h6>`,
			].join('\n'),
		);
	});

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

	it('#66 | @MOD: enhanced heading with attributes', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-66
		expect(engrave('# foo *bar* \\*baz\\*').html()).toBe(
			'<h1 id="foo-bar-baz" data-text="foo bar *baz*">foo <em>bar</em> *baz*</h1>',
		);
	});

	it('#67 | @MOD: enhanced heading with attributes', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-67
		expect(engrave('#                  foo                     ').html()).toBe(
			'<h1 id="foo" data-text="foo">foo</h1>',
		);
	});

	it('#68 | @MOD: enhanced heading with attributes', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-68
		expect(engrave(' ### foo\n  ## foo\n   # foo').html()).toBe(
			[
				'<h3 id="foo" data-text="foo">foo</h3>',
				'<h2 id="foo" data-text="foo">foo</h2>',
				'<h1 id="foo" data-text="foo">foo</h1>',
			].join('\n'),
		);
	});

	// @DISALLOWED: 80-106 [setext headings]

	it.todo('#149', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-149
		expect(
			engrave(
				[
					'<table>',
					'  <tr>',
					'    <td>',
					'           hi',
					'    </td>',
					'  </tr>',
					'</table>',
					'',
					'okay.',
				].join('\n'),
			).html(),
		).toBe(
			[
				'<table>',
				'  <tr>',
				'    <td>',
				'           hi',
				'    </td>',
				'  </tr>',
				'</table>',
				'<p>okay.</p>',
			].join('\n'),
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
