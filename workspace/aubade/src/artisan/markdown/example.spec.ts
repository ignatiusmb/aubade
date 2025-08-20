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

	it('#22', ({ expect }) => {
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

	it('#26', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-26
		expect(engrave('&#35; &#1234; &#992; &#0;').html()).toBe('<p># Ӓ Ϡ �</p>');
	});

	it('#27', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-27
		expect(engrave('&#X22; &#XD06; &#xcab;').html()).toBe('<p>&quot; ആ ಫ</p>');
	});

	it.skip('#28', ({ expect }) => {
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

	it.skip('#30', ({ expect }) => {
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

	it('#35', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-35
		expect(engrave('`f&ouml;&ouml;`').html()).toBe('<p><code>f&amp;ouml;&amp;ouml;</code></p>');
	});

	it('#36 | @MOD: code blocks with triple backticks', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-36
		expect(engrave('```\nf&ouml;f&ouml;\n```').html()).toBe(
			'<pre><code>f&amp;ouml;f&amp;ouml;</code></pre>',
		);
	});

	it('#37', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-37
		expect(engrave('&#42;foo&#42;\n*foo*').html()).toBe('<p>*foo*\n<em>foo</em></p>');
	});

	it.todo('#38', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-38
		expect(engrave('&#42; foo\n\n* foo').html()).toBe('<p>* foo</p>\n<ul>\n<li>foo</li>\n</ul>');
	});

	it('#39', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-39
		expect(engrave('foo&#10;&#10;bar').html()).toBe('<p>foo\n\nbar</p>');
	});

	it('#40', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-40
		expect(engrave('&#9;foo').html()).toBe('<p>\tfoo</p>');
	});

	it('#41', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-41
		expect(engrave('[a](url &quot;tit&quot;)').html()).toBe('<p>[a](url &quot;tit&quot;)</p>');
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
				'<h2 id="foo-1" data-text="foo">foo</h2>',
				'<h1 id="foo-2" data-text="foo">foo</h1>',
			].join('\n'),
		);
	});

	it('#69 | @DIS: indentation is ignored', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-69
		expect(engrave('    # foo').html()).toBe('<h1 id="foo" data-text="foo">foo</h1>');
	});

	it('#70 | @DIS: indentation is ignored', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-70
		expect(engrave('foo\n    # bar').html()).toBe(
			'<p>foo</p>\n<h1 id="bar" data-text="bar">bar</h1>',
		);
	});

	it('#71 | @MOD: closing sequence treated literally', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-71
		expect(engrave('## foo ##\n  ###   bar    ###').html()).toBe(
			[
				'<h2 id="foo" data-text="foo ##">foo ##</h2>',
				'<h3 id="foo-bar" data-text="bar    ###">bar    ###</h3>',
			].join('\n'),
		);
	});

	it('#72 | @MOD: closing sequence treated literally', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-72
		expect(engrave('# foo ##################################\n##### foo ##').html()).toBe(
			[
				'<h1 id="foo" data-text="foo ##################################">foo ##################################</h1>',
				'<h5 id="foo-foo" data-text="foo ##">foo ##</h5>',
			].join('\n'),
		);
	});

	it('#73 | @MOD: closing sequence treated literally', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-73
		expect(engrave('### foo ###     ').html()).toBe(
			'<h3 id="foo" data-text="foo ###">foo ###</h3>',
		);
	});

	it('#74 | @MOD: enhanced heading with attributes', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-74
		expect(engrave('### foo ### b').html()).toBe(
			'<h3 id="foo-b" data-text="foo ### b">foo ### b</h3>',
		);
	});

	it('#75 | @MOD: enhanced heading with attributes', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-75
		expect(engrave('# foo#').html()).toBe('<h1 id="foo" data-text="foo#">foo#</h1>');
	});

	it('#76 | @MOD: closing sequence treated literally', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-76
		expect(engrave('### foo \\###\n## foo #\\##\n# foo \\#').html()).toBe(
			[
				'<h3 id="foo" data-text="foo ###">foo ###</h3>',
				'<h2 id="foo-1" data-text="foo ###">foo ###</h2>',
				'<h1 id="foo-2" data-text="foo #">foo #</h1>',
			].join('\n'),
		);
	});

	it('#77 | @MOD: heading wrapped in paragraphs', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-77
		expect(engrave('****\n## foo\n****').html()).toBe(
			['<p>****</p>', '<h2 id="foo" data-text="foo">foo</h2>', '<p>****</p>'].join('\n'),
		);
	});

	it('#78 | @MOD: heading wrapped in paragraphs', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-78
		expect(engrave('Foo bar\n# baz\nBar foo').html()).toBe(
			['<p>Foo bar</p>', '<h1 id="baz" data-text="baz">baz</h1>', '<p>Bar foo</p>'].join('\n'),
		);
	});

	it('#79 | @DIS: ATX heading cannot be empty', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-79
		expect(engrave('## \n#\n### ###').html()).toBe(
			['<p>##', '#</p>', '<h3 data-text="###">###</h3>'].join('\n'),
		);
	});

	it('#80 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-80
		expect(
			engrave(['Foo *bar*', '=========', '', 'Foo *bar*', '---------'].join('\n')).html(),
		).toBe(
			['<p>Foo <em>bar</em>', '=========</p>', '<p>Foo <em>bar</em>', '---------</p>'].join('\n'),
		);
	});

	it('#81 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-81
		expect(engrave(['Foo *bar', 'baz*', '===='].join('\n')).html()).toBe(
			['<p>Foo <em>bar', 'baz</em>', '====</p>'].join('\n'),
		);
	});

	it('#82 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-82
		expect(engrave(['Foo *bar', 'baz*\t', '===='].join('\n')).html()).toBe(
			['<p>Foo <em>bar', 'baz</em>', '====</p>'].join('\n'),
		);
	});

	it('#83 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-83
		expect(engrave(['Foo', '-------------------------', '', 'Foo', '='].join('\n')).html()).toBe(
			['<p>Foo', '-------------------------</p>', '<p>Foo', '=</p>'].join('\n'),
		);
	});

	it('#84 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-84
		expect(
			engrave(['   Foo', '---', '', '  Foo', '-----', '', '  Foo', '  ==='].join('\n')).html(),
		).toBe(['<p>Foo</p>', '<hr />', '<p>Foo', '-----</p>', '<p>Foo', '===</p>'].join('\n'));
	});

	it('#85 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-85
		expect(engrave(['    Foo', '    ---', '', '    Foo', '---'].join('\n')).html()).toBe(
			['<p>Foo</p>', '<hr />', '<p>Foo</p>', '<hr />'].join('\n'),
		);
	});

	it('#86 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-86
		expect(engrave(['Foo', '   ----      '].join('\n')).html()).toBe(
			['<p>Foo', '----</p>'].join('\n'),
		);
	});

	it('#87 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-87
		expect(engrave(['Foo', '    ---'].join('\n')).html()).toBe(['<p>Foo</p>', '<hr />'].join('\n'));
	});

	it('#88 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-88
		expect(engrave(['Foo', '= =', '', 'Foo', '--- -'].join('\n')).html()).toBe(
			['<p>Foo', '= =</p>', '<p>Foo', '--- -</p>'].join('\n'),
		);
	});

	it('#89 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-89
		expect(engrave(['Foo  ', '-----'].join('\n')).html()).toBe(['<p>Foo', '-----</p>'].join('\n'));
	});

	it('#90 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-90
		expect(engrave(['Foo\\', '----'].join('\n')).html()).toBe(['<p>Foo', '----</p>'].join('\n'));
	});

	it('#91 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-91
		expect(
			engrave(
				['`Foo', '----', '`', '', '<a title="a lot', '---', 'of dashes"/>'].join('\n'),
			).html(),
		).toBe(
			[
				'<p><code>Foo ---- </code></p>',
				'<p>&lt;a title=&quot;a lot</p>',
				'<hr />',
				'<p>of dashes&quot;/&gt;</p>',
			].join('\n'),
		);
	});

	it('#92', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-92
		expect(engrave(['> Foo', '---'].join('\n')).html()).toBe(
			['<blockquote><p>Foo</p></blockquote>', '<hr />'].join('\n'),
		);
	});

	it('#93 | @DIS: no setext headings and implicit blockquote', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-93
		expect(engrave(['> foo', '> bar', '> ==='].join('\n')).html()).toBe(
			['<blockquote><p>foo', 'bar', '===</p></blockquote>'].join('\n'),
		);
	});

	it.todo('#94 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-94
		expect(engrave(['- Foo', '---'].join('\n')).html()).toBe(
			['<ul>', '<li>Foo</li>', '</ul>', '<hr />'].join('\n'),
		);
	});

	it('#95 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-95
		expect(engrave(['Foo', 'Bar', '---'].join('\n')).html()).toBe(
			['<p>Foo', 'Bar</p>', '<hr />'].join('\n'),
		);
	});

	it('#96 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-96
		expect(engrave(['---', 'Foo', '---', 'Bar', '---', 'Baz'].join('\n')).html()).toBe(
			['<hr />', '<p>Foo</p>', '<hr />', '<p>Bar</p>', '<hr />', '<p>Baz</p>'].join('\n'),
		);
	});

	it('#97', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-97
		expect(engrave(['', '===='].join('\n')).html()).toBe('<p>====</p>');
	});

	it('#98 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-98
		expect(engrave(['---', '---'].join('\n')).html()).toBe(['<hr />', '<hr />'].join('\n'));
	});

	it.todo('#99 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-99
		expect(engrave(['- foo', '-----'].join('\n')).html()).toBe(
			['<ul>', '<li>foo</li>', '</ul>', '<p>-----</p>'].join('\n'),
		);
	});

	it('#100 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-100
		expect(engrave(['    foo', '---'].join('\n')).html()).toBe(['<p>foo</p>', '<hr />'].join('\n'));
	});

	it('#101 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-101
		expect(engrave(['> foo', '-----'].join('\n')).html()).toBe(
			['<blockquote><p>foo</p></blockquote>', '<p>-----</p>'].join('\n'),
		);
	});

	it('#102 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-102
		expect(engrave(['\\> foo', '-----'].join('\n')).html()).toBe(
			['<p>&gt; foo', '-----</p>'].join('\n'),
		);
	});

	it('#103 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-103
		expect(engrave(['Foo', '', 'bar', '---', 'baz'].join('\n')).html()).toBe(
			['<p>Foo</p>', '<p>bar</p>', '<hr />', '<p>baz</p>'].join('\n'),
		);
	});

	it('#104 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-104
		expect(engrave(['Foo', 'bar', '', '---', '', 'baz'].join('\n')).html()).toBe(
			['<p>Foo', 'bar</p>', '<hr />', '<p>baz</p>'].join('\n'),
		);
	});

	it('#105 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-105
		expect(engrave(['Foo', 'bar', '* * *', 'baz'].join('\n')).html()).toBe(
			['<p>Foo', 'bar', '* * *', 'baz</p>'].join('\n'),
		);
	});

	it('#106 | @DIS: no setext headings', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-106
		expect(engrave(['Foo', 'bar', '\\---', 'baz'].join('\n')).html()).toBe(
			['<p>Foo', 'bar', '---', 'baz</p>'].join('\n'),
		);
	});

	// @DISALLOWED: 107-118 [indented code blocks]
	// @TODO: 119-147

	it.todo('#148', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-148
		expect(
			engrave(
				[
					'<table><tr><td>',
					'<pre>',
					'**Hello**,',
					'',
					'_world_.',
					'</pre>',
					'</td</tr></table>',
				].join('\n'),
			).html(),
		).toBe(
			[
				'<table><tr><td>',
				'<pre>',
				'**Hello**,',
				'<p><em>world</em>.',
				'</pre></p>',
				'</td</tr></table>',
			].join('\n'),
		);
	});

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

	// @TODO: 150-191

	// @TODO: 192-218 [link reference definitions]

	it('#219', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-219
		expect(engrave('aaa\n\nbbb').html()).toBe('<p>aaa</p>\n<p>bbb</p>');
	});

	it('#220', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-220
		expect(engrave('aaa\nbbb\n\nccc\nddd').html()).toBe('<p>aaa\nbbb</p>\n<p>ccc\nddd</p>');
	});

	it('#221', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-221
		expect(engrave('aaa\n\n\nbbb').html()).toBe('<p>aaa</p>\n<p>bbb</p>');
	});

	it('#222', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-222
		expect(engrave('  aaa\n bbb').html()).toBe('<p>aaa\nbbb</p>');
	});

	it('#223', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-223
		expect(engrave(['aaa', ' '.repeat(13) + 'bbb', ' '.repeat(39) + 'ccc'].join('\n')).html()).toBe(
			'<p>aaa\nbbb\nccc</p>',
		);
	});

	it('#224', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-224
		expect(engrave(['   aaa', 'bbb'].join('\n')).html()).toBe('<p>aaa\nbbb</p>');
	});

	it('#225 | @DIS: four spaces indentation means nothing', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-225
		expect(engrave(['    aaa', 'bbb'].join('\n')).html()).toBe('<p>aaa\nbbb</p>');
	});

	it('#226 | @MOD: no discriminated hard line break', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-226
		expect(engrave(['aaa     ', 'bbb     '].join('\n')).html()).toBe('<p>aaa\nbbb</p>');

		const modified = forge({ renderer: { 'inline:break': () => '<br />\n' } });
		expect(modified('aaa     \nbbb     ').html()).toBe('<p>aaa<br />\nbbb</p>');
	});

	it('#227 | @MOD: enhanced heading', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-227
		expect(engrave(['  ', '', 'aaa', '  ', '', '# aaa', '', '  '].join('\n')).html()).toBe(
			'<p>aaa</p>\n<h1 id="aaa" data-text="aaa">aaa</h1>',
		);
	});

	// @TODO: 228-252 [block quotes]
	// @TODO: 253-300 [list items]
	// @TODO: 301-326 [lists]

	it('#327', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-327
		expect(engrave('`hi`lo`').html()).toBe('<p><code>hi</code>lo`</p>');
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

	it('#330', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-330
		expect(engrave('` `` `').html()).toBe('<p><code>``</code></p>');
	});

	it('#331', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-331
		expect(engrave('`  ``  `').html()).toBe('<p><code> `` </code></p>');
	});

	it('#332', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-332
		expect(engrave('` a`').html()).toBe('<p><code> a</code></p>');
	});

	it('#333', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-333
		expect(engrave('` b `').html()).toBe('<p><code> b </code></p>');
	});

	it('#334', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-334
		expect(engrave('` `\n`  `').html()).toBe('<p><code> </code>\n<code>  </code></p>');
	});

	it('#335 | @MOD: trailing spaces are trimmed', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-335
		expect(engrave('``\nfoo\nbar  \nbaz\n``').html()).toBe('<p><code>foo bar baz</code></p>');
	});

	it('#336 | @MOD: padding quirks', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-336
		expect(engrave('``\nfoo \n``').html()).toBe('<p><code> foo </code></p>');
	});

	it('#337 | @MOD: trailing spaces are trimmed', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-337
		expect(engrave('`foo   bar \nbaz`').html()).toBe('<p><code>foo   bar baz</code></p>');
	});

	it('#338', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-338
		expect(engrave('`foo\\`bar`').html()).toBe('<p><code>foo\\</code>bar`</p>');
	});

	it('#339', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-339
		expect(engrave('``foo`bar``').html()).toBe('<p><code>foo`bar</code></p>');
	});

	it('#340', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-340
		expect(engrave('` foo `` bar `').html()).toBe('<p><code>foo `` bar</code></p>');
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

	it.todo('#344', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-344
		expect(engrave('<a href="`">`').html()).toBe('<p><a href="`">`</p>');
	});

	it('#345', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-345
		expect(engrave('`<https://foo.bar.`baz>`').html()).toBe(
			'<p><code>&lt;https://foo.bar.</code>baz&gt;`</p>',
		);
	});

	it('#346', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-346
		expect(engrave('<https://foo.bar.`baz>`').html()).toBe(
			'<p><a href="https://foo.bar.%60baz">https://foo.bar.`baz</a>`</p>',
		);
	});

	it.todo('#347', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-347
		expect(engrave('```foo``').html()).toBe('<p>```foo``</p>');
	});

	it('#348', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-348
		expect(engrave('`foo').html()).toBe('<p>`foo</p>');
	});

	it('#349', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-349
		expect(engrave('`foo``bar``').html()).toBe('<p>`foo<code>bar</code></p>');
	});

	it('#350', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-350
		expect(engrave('*foo bar*').html()).toBe('<p><em>foo bar</em></p>');
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

	it('#382', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-382
		expect(engrave('__foo bar__').html()).toBe('<p><strong>foo bar</strong></p>');
	});

	it('#383', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-383
		expect(engrave('__ foo bar__').html()).toBe('<p>__ foo bar__</p>');
	});

	it('#384', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-384
		expect(engrave('__\nfoo bar__').html()).toBe('<p>__\nfoo bar__</p>');
	});

	it('#385', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-385
		expect(engrave('a__"foo"__').html()).toBe('<p>a__&quot;foo&quot;__</p>');
	});

	it('#386', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-386
		expect(engrave('foo__bar__').html()).toBe('<p>foo__bar__</p>');
	});

	it('#387', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-387
		expect(engrave('5__6__78').html()).toBe('<p>5__6__78</p>');
	});

	it('#388', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-388
		expect(engrave('пристаням__стремятся__').html()).toBe('<p>пристаням__стремятся__</p>');
	});

	it('#389', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-389
		expect(engrave('__foo, __bar__, baz__').html()).toBe(
			'<p><strong>foo, <strong>bar</strong>, baz</strong></p>',
		);
	});

	it('#390', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-390
		expect(engrave('foo-__(bar)__').html()).toBe('<p>foo-<strong>(bar)</strong></p>');
	});

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

	it('#394', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-394
		expect(
			engrave('**Gomphocarpus (*Gomphocarpus physocarpus*, syn.\n*Asclepias physocarpa*)**').html(),
		).toBe(
			'<p><strong>Gomphocarpus (<em>Gomphocarpus physocarpus</em>, syn.\n<em>Asclepias physocarpa</em>)</strong></p>',
		);
	});

	it('#395', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-395
		expect(engrave('**foo "*bar*" foo**').html()).toBe(
			'<p><strong>foo &quot;<em>bar</em>&quot; foo</strong></p>',
		);
	});

	it('#396', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-396
		expect(engrave('**foo**bar').html()).toBe('<p><strong>foo</strong>bar</p>');
	});

	it('#397', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-397
		expect(engrave('__foo bar __').html()).toBe('<p>__foo bar __</p>');
	});

	it('#398', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-398
		expect(engrave('__(__foo)').html()).toBe('<p>__(__foo)</p>');
	});

	it('#399', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-399
		expect(engrave('_(__foo__)_').html()).toBe('<p><em>(<strong>foo</strong>)</em></p>');
	});

	it('#400', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-400
		expect(engrave('__foo__bar').html()).toBe('<p>__foo__bar</p>');
	});

	it('#401', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-401
		expect(engrave('__пристаням__стремятся').html()).toBe('<p>__пристаням__стремятся</p>');
	});

	it('#402', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-402
		expect(engrave('__foo__bar__baz__').html()).toBe('<p><strong>foo__bar__baz</strong></p>');
	});

	it('#403', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-403
		expect(engrave('__(bar)__.').html()).toBe('<p><strong>(bar)</strong>.</p>');
	});

	it('#404', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-404
		expect(engrave('*foo [bar](/url)*').html()).toBe('<p><em>foo <a href="/url">bar</a></em></p>');
	});

	it('#405', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-405
		expect(engrave('*foo\nbar*').html()).toBe('<p><em>foo\nbar</em></p>');
	});

	it('#406', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-406
		expect(engrave('_foo __bar__ baz_').html()).toBe(
			'<p><em>foo <strong>bar</strong> baz</em></p>',
		);
	});

	it('#407', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-407
		expect(engrave('_foo _bar_ baz_').html()).toBe('<p><em>foo <em>bar</em> baz</em></p>');
	});

	it('#408', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-408
		expect(engrave('__foo_ bar_').html()).toBe('<p><em><em>foo</em> bar</em></p>');
	});

	it('#409', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-409
		expect(engrave('*foo *bar**').html()).toBe('<p><em>foo <em>bar</em></em></p>');
	});

	it('#410', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-410
		expect(engrave('*foo **bar** baz*').html()).toBe(
			'<p><em>foo <strong>bar</strong> baz</em></p>',
		);
	});

	it('#411', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-411
		expect(engrave('*foo**bar**baz*').html()).toBe('<p><em>foo<strong>bar</strong>baz</em></p>');
	});

	it.todo('#412', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-412
		expect(engrave('*foo**bar*').html()).toBe('<p><em>foo**bar</em></p>');
	});

	// @TODO: 413-481

	it('#482', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-482
		expect(engrave('[link](/uri "title")').html(), '<p><a href="/uri" title="title">link</a></p>');
	});

	// @TODO: 483-652
});
