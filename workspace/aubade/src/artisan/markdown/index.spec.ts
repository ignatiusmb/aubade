import { describe } from 'vitest';
import { engrave } from './index.js';

describe('block', ({ concurrent: it }) => {
	it('header | annotate inline styles', ({ expect }) => {
		expect(engrave('# header with `code`').html()).toBe(
			'<h1 id="header-with-code" data-text="header with code">header with <code>code</code></h1>',
		);
		expect(engrave('# header with *emphasis*').html()).toBe(
			'<h1 id="header-with-emphasis" data-text="header with emphasis">header with <em>emphasis</em></h1>',
		);
		expect(engrave('# header with **bold**').html()).toBe(
			'<h1 id="header-with-bold" data-text="header with bold">header with <strong>bold</strong></h1>',
		);
	});
	it('header | automatic id prefixes', ({ expect }) => {
		expect(engrave(['## main', '### sub'].join('\n')).html()).toBe(
			[
				'<h2 id="main" data-text="main">main</h2>',
				'<h3 id="main-sub" data-text="sub">sub</h3>',
			].join('\n'),
		);
		expect(
			engrave(['## first', '### sub', '#### four', '## second', '### sub'].join('\n')).html(),
		).toBe(
			[
				'<h2 id="first" data-text="first">first</h2>',
				'<h3 id="first-sub" data-text="sub">sub</h3>',
				'<h4 id="first-sub-four" data-text="four">four</h4>',
				'<h2 id="second" data-text="second">second</h2>',
				'<h3 id="second-sub" data-text="sub">sub</h3>',
			].join('\n'),
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

	it.todo('list | unordered and ordered', ({ expect }) => {
		expect(engrave('- a\n- b\n- c').html()).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
		expect(engrave('* a\n* b\n* c').html()).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
		expect(engrave('1. one\n2. two\n3. three').html()).toBe(
			'<ol><li>one</li><li>two</li><li>three</li></ol>',
		);
		expect(engrave('1. a\n- b\n- c').html()).toBe(
			'<ol><li>a<ul><li>b</li><li>c</li></ul></li></ol>',
		);
	});

	it('quote | basic quoted text', ({ expect }) => {
		expect(engrave('> quote').html()).toBe('<blockquote><p>quote</p></blockquote>');
	});
	it('quote | annotated text', ({ expect }) => {
		expect(engrave('> quote with **formatting** and `inline code`.').html()).toBe(
			'<blockquote><p>quote with <strong>formatting</strong> and <code>inline code</code>.</p></blockquote>',
		);
	});

	it.todo('table | basic markdown table', ({ expect }) => {
		expect(engrave('| a | b |\n|---|---|\n| 1 | 2 |').html()).toBe(
			'<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>',
		);
	});
	it('HTML entities', ({ expect }) => {
		expect(engrave('&amp; &lt; &gt;').html()).toBe('<p>&amp; &lt; &gt;</p>');
		expect(engrave('&copy; 2025').html()).toBe('<p>&copy; 2025</p>');
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

	it('modifiers | nested unique emphasis', ({ expect }) => {
		expect(engrave('_**italic bold**_').html()).toBe(
			'<p><em><strong>italic bold</strong></em></p>',
		);
		expect(engrave('**_bold italic_**').html()).toBe(
			'<p><strong><em>bold italic</em></strong></p>',
		);
	});
	it('modifiers | nested common emphasis', ({ expect }) => {
		expect(engrave('***both***').html()).toBe('<p><em><strong>both</strong></em></p>');
	});
	it('modifiers | markers for strikethrough', ({ expect }) => {
		expect(engrave('~~strike~~').html()).toBe('<p><s>strike</s></p>');
	});
	it('modifiers | modified links', ({ expect }) => {
		expect(engrave('**[a b c](https://mauss.dev)**').html()).toBe(
			'<p><strong><a href="https://mauss.dev">a b c</a></strong></p>',
		);
	});
});
