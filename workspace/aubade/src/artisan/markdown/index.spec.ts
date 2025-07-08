import { describe } from 'vitest';
import { engrave } from './index.js';

describe('block', ({ concurrent: it }) => {
	it('header | ATX headings from 1 to 6 #', ({ expect }) => {
		// expected: corresponding HTML <h1> to <h6> tags
		expect(engrave('# abc').html()).toBe('<h1 id="abc">abc</h1>');
		expect(engrave('## abc').html()).toBe('<h2 id="abc">abc</h2>');
		expect(engrave('### abc').html()).toBe('<h3 id="abc">abc</h3>');
		expect(engrave('#### abc').html()).toBe('<h4 id="abc">abc</h4>');
		expect(engrave('##### abc').html()).toBe('<h5 id="abc">abc</h5>');
		expect(engrave('###### abc').html()).toBe('<h6 id="abc">abc</h6>');
	});
	it('header | ATX invalid headings', ({ expect }) => {
		expect(engrave('####### abc').html()).toBe('<p>####### abc</p>');
		expect(engrave('#5 abc').html()).toBe('<p>#5 abc</p>');
		expect(engrave('#hashtag').html()).toBe('<p>#hashtag</p>');
		expect(engrave('\\## escaped').html()).toBe('<p>## escaped</p>');
	});
	it('header | ATX headings with inline styles', ({ expect }) => {
		expect(engrave('# header with `code`').html()).toBe(
			'<h1 id="header-with-code">header with <code>code</code></h1>',
		);
		expect(engrave('# header with *emphasis*').html()).toBe(
			'<h1 id="header-with-emphasis">header with <em>emphasis</em></h1>',
		);
		expect(engrave('# header with **bold**').html()).toBe(
			'<h1 id="header-with-bold">header with <strong>bold</strong></h1>',
		);
	});
	it('header | ATX headings automatic id prefix', ({ expect }) => {
		expect(engrave('## main\n### sub').html()).toBe(
			'<h2 id="main">main</h2>\n<h3 id="main-sub">sub</h3>',
		);
		expect(engrave('## first\n### sub\n#### four\n## second\n### sub').html()).toBe(
			'<h2 id="first">first</h2>\n<h3 id="first-sub">sub</h3>\n<h4 id="first-sub-four">four</h4>\n<h2 id="second">second</h2>\n<h3 id="second-sub">sub</h3>',
		);
	});

	it('codeblock | fenced code blocks', ({ expect }) => {
		// expected: <pre><code> tags with optional language class
		expect(engrave('```\ncode\n```').html()).toBe('<pre><code>code</code></pre>');
		expect(engrave('```js\ncode\n```').html()).toBe(
			'<pre data-language="js"><code>code</code></pre>',
		);
		expect(engrave('```\ncode\nline\n```').html()).toBe(
			'<pre><code>code</code>\n<code>line</code></pre>',
		);
	});
	it.skip('list | unordered and ordered', ({ expect }) => {
		// expected: <ul> and <ol> tags with <li> children
		expect(engrave('- a\n- b\n- c').html()).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
		expect(engrave('* a\n* b\n* c').html()).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
		expect(engrave('1. one\n2. two\n3. three').html()).toBe(
			'<ol><li>one</li><li>two</li><li>three</li></ol>',
		);
		expect(engrave('1. a\n- b\n- c').html()).toBe(
			'<ol><li>a<ul><li>b</li><li>c</li></ul></li></ol>',
		);
	});
	it.skip('list | precedence over inline constructs', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-42
		expect(engrave('- `one\n- two`').html()).toBe('<ul><li>`one</li><li>two`</li></ul>');
	});

	it('quote | basic quoted text', ({ expect }) => {
		// expected: <blockquote> tags
		expect(engrave('> quote').html()).toBe('<blockquote><p>quote</p></blockquote>');
	});
	it.skip('table | basic markdown table', ({ expect }) => {
		// expected: <table> with its children
		expect(engrave('| a | b |\n|---|---|\n| 1 | 2 |').html()).toBe(
			'<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>',
		);
	});
	it.skip('HTML entities', ({ expect }) => {
		// expected: entities should be rendered as their corresponding characters
		expect(engrave('&amp; &lt; &gt;').html()).toBe('<p>& < ></p>');
		expect(engrave('&copy; 2025').html()).toBe('<p>© 2025</p>');
	});

	it('reference links', ({ expect }) => {
		// expected: links should be correctly resolved
		expect;
	});
});

describe('inline', ({ concurrent: it }) => {
	it('escape | backslash escape', ({ expect }) => {
		expect(engrave('\\*not italic\\*').html()).toBe('<p>*not italic*</p>');
		expect(engrave('\\\\').html()).toBe('<p>\\</p>');
	});

	it('text', ({ expect }) => {
		// expected: the same text without any modifications
		expect(engrave('hello world').html()).toBe('<p>hello world</p>');
	});

	it('code | with literal backslash', ({ expect }) => {
		expect(engrave('`\\`').html()).toBe('<p><code>\\</code></p>');
	});
	it('code | takes precedence over other constructs', ({ expect }) => {
		expect(engrave('`*foo*`').html()).toBe('<p><code>*foo*</code></p>');
		expect(engrave('`**foo**`').html()).toBe('<p><code>**foo**</code></p>');
	});
	it('code | edge cases', ({ expect }) => {
		expect(engrave('``backtick``').html()).toBe('<p><code>backtick</code></p>');
		expect(engrave('`` ` ``').html()).toBe('<p><code>`</code></p>');
	});

	it('image | ![alt](src)', ({ expect }) => {
		expect(engrave('hello ![wave emoji](wave.png)').html()).toBe(
			'<p>hello <img src="wave.png" alt="wave emoji" /></p>',
		);
	});
	it('image | titled', ({ expect }) => {
		expect(engrave('hello ![wave](wave.png "emoji")').html()).toBe(
			'<p>hello <img src="wave.png" alt="wave" title="emoji" /></p>',
		);
	});
	it('image | complex alt text', ({ expect }) => {
		expect(engrave('![*italic* alt](img.png)').html()).toBe(
			'<p><img src="img.png" alt="*italic* alt" /></p>',
		);
	});

	it('autolink | bracketed links', ({ expect }) => {
		expect(engrave('<https://mauss.dev>').html()).toBe(
			'<p><a href="https://mauss.dev">https://mauss.dev</a></p>',
		);
		expect(engrave('<no-reply@github.com>').html()).toBe(
			'<p><a href="mailto:no-reply@github.com">no-reply@github.com</a></p>',
		);
	});

	it('link | hyperlinks [text](url)', ({ expect }) => {
		expect(engrave('[link](https://mauss.dev)').html()).toBe(
			'<p><a href="https://mauss.dev">link</a></p>',
		);
	});
	it('link | invalid hyperlinks', ({ expect }) => {
		expect(engrave('[foo`]`(bar)').html()).toBe('<p>[foo<code>]</code>(bar)</p>');
	});
	it('link | nested and multiline links', ({ expect }) => {
		expect(engrave('[a **b** c](https://mauss.dev)').html()).toBe(
			'<p><a href="https://mauss.dev">a <strong>b</strong> c</a></p>',
		);
		expect(engrave('[line\nbreak](https://mauss.dev)').html()).toBe(
			'<p><a href="https://mauss.dev">line break</a></p>',
		);
	});

	it('modifiers | markers for italics and/or bold', ({ expect }) => {
		expect(engrave('*italic*').html()).toBe('<p><em>italic</em></p>');
		expect(engrave('**bold**').html()).toBe('<p><strong>bold</strong></p>');
		expect(engrave('***bold italic***').html()).toBe(
			'<p><strong><em>bold italic</em></strong></p>',
		);
		expect(engrave('_**italic bold**_').html()).toBe(
			'<p><em><strong>italic bold</strong></em></p>',
		);
	});
	it('modifiers | markers for strikethrough', ({ expect }) => {
		expect(engrave('~~strike~~').html()).toBe('<p><s>strike</s></p>');
	});
	it('modifiers | modified links', ({ expect }) => {
		expect(engrave('**[a b c](https://mauss.dev)**').html()).toBe(
			'<p><strong><a href="https://mauss.dev">a b c</a></strong></p>',
		);
	});
	it.skip('modifiers | incomplete or broken', ({ expect }) => {
		expect(engrave('**not closed').html()).toBe('<p>**not closed</p>');
		expect(engrave('*in **out*').html()).toBe('<p><em>in **out</em></p>');
		expect(engrave('~~strike').html()).toBe('<p>~~strike</p>');
	});
});
