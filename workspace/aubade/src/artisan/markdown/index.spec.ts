import { describe } from 'vitest';
import { markdown } from './index.js';

const marker = markdown();

describe('inline', ({ concurrent: it }) => {
	it('text', ({ expect }) => {
		// expected: the same text without any modifications
		expect(marker('hello world').html()).toBe('<p>hello world</p>');
	});

	it('code | with literal backslash', ({ expect }) => {
		expect(marker('`\\`').html()).toBe('<p><code>\\</code></p>');
	});
	it('code | takes precedence over other constructs', ({ expect }) => {
		expect(marker('`*foo*`').html()).toBe('<p><code>*foo*</code></p>');
		expect(marker('`**foo**`').html()).toBe('<p><code>**foo**</code></p>');
	});

	it('link | hyperlinks [text](url)', ({ expect }) => {
		expect(marker('[link](https://example.com)').html()).toBe(
			'<p><a href="https://example.com">link</a></p>',
		);
	});
	it('link | invalid hyperlinks', ({ expect }) => {
		expect(marker('[foo`]`(bar)').html()).toBe('<p>[foo<code>]</code>(bar)</p>');
	});
	it('link | hyperlinks with bare URLs', ({ expect }) => {
		// expected: <a href="url">url</a>
		expect;
	});

	it('image | ![alt](src)', ({ expect }) => {
		// expected: <img src="src" alt="alt">
		expect;
	});
	it('image | titled', ({ expect }) => {
		// expected: <img src="src" alt="alt" aria-title="title">
		expect;
	});

	it('modifiers | markers for italics and/or bold', ({ expect }) => {
		expect(marker('*italic*').html()).toBe('<p><em>italic</em></p>');
		expect(marker('**bold**').html()).toBe('<p><strong>bold</strong></p>');
		expect(marker('***bold italic***').html()).toBe('<p><strong><em>bold italic</em></strong></p>');
	});
	it('modifiers | markers for strikethrough', ({ expect }) => {
		expect(marker('~~strike~~').html()).toBe('<p><s>strike</s></p>');
	});
});

describe('block', ({ concurrent: it }) => {
	it('header | ATX headings from 1 to 6 #', ({ expect }) => {
		// expected: corresponding HTML <h1> to <h6> tags
		expect(marker('# abc').html()).toBe('<h1 id="abc">abc</h1>');
		expect(marker('## abc').html()).toBe('<h2 id="abc">abc</h2>');
		expect(marker('### abc').html()).toBe('<h3 id="abc">abc</h3>');
		expect(marker('#### abc').html()).toBe('<h4 id="abc">abc</h4>');
		expect(marker('##### abc').html()).toBe('<h5 id="abc">abc</h5>');
		expect(marker('###### abc').html()).toBe('<h6 id="abc">abc</h6>');
	});
	it('header | ATX invalid headings', ({ expect }) => {
		expect(marker('####### abc').html()).toBe('<p>####### abc</p>');
		expect(marker('#5 abc').html()).toBe('<p>#5 abc</p>');
		expect(marker('#hashtag').html()).toBe('<p>#hashtag</p>');
		expect(marker('\\## escaped').html()).toBe('<p>## escaped</p>');
	});
	it('header | ATX headings with inline styles', ({ expect }) => {
		expect(marker('# header with `code`').html()).toBe(
			'<h1 id="header-with-code">header with <code>code</code></h1>',
		);
		expect(marker('# header with *emphasis*').html()).toBe(
			'<h1 id="header-with-emphasis">header with <em>emphasis</em></h1>',
		);
		expect(marker('# header with **bold**').html()).toBe(
			'<h1 id="header-with-bold">header with <strong>bold</strong></h1>',
		);
	});
	it('header | ATX headings automatic id prefix', ({ expect }) => {
		expect(marker('## main\n### sub').html()).toBe(
			'<h2 id="main">main</h2>\n<h3 id="main-sub">sub</h3>',
		);
	});

	it('codeblock | fenced code blocks', ({ expect }) => {
		// expected: <pre><code> tags with optional language class
		expect(marker('```\ncode\n```').html()).toBe('<pre><code>code</code></pre>');
		expect(marker('```js\ncode\n```').html()).toBe(
			'<pre data-language="js"><code>code</code></pre>',
		);
		expect(marker('```\ncode\nline\n```').html()).toBe(
			'<pre><code>code</code>\n<code>line</code></pre>',
		);
	});
	it('list | unordered and ordered', ({ expect }) => {
		// expected: <ul> and <ol> tags with <li> children
		expect;
	});
	it.skip('list | precedence over inline constructs', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-42
		expect(marker('- `one\n- two`').html()).toBe('<ul><li>`one</li><li>two`</li></ul>');
	});

	it('quote', ({ expect }) => {
		// expected: <blockquote> tags
		expect(marker('> quote').html()).toBe('<blockquote><p>quote</p></blockquote>');
	});
	it('table', ({ expect }) => {
		// expected: <table> with its children
		expect;
	});
	it('HTML entities', ({ expect }) => {
		// expected: entities should be rendered as their corresponding characters
		expect;
	});

	it('reference links', ({ expect }) => {
		// expected: links should be correctly resolved
		expect;
	});
	it.skip('backslash escapes', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-12
		expect(
			marker(
				'\\!\\"\\#\\$\\%\\&\\\'\\(\\)\\*\\+\\,\\-\\.\\/\\:\\;\\<\\=\\>\\?\\@\\[\\\\\\]\\^\\_\\`\\{\\|\\}\\~',
			).html(),
		).toBe("<p>!&quot;#$%&amp;'()*+,-./:;&lt;=&gt;?@[]^_`{|}~</p>");
		// https://spec.commonmark.org/0.31.2/#example-13
		expect(marker('\\→\\A\\a\\ \\3\\φ\\«').html()).toBe('<p>\\→\\A\\a\\ \\3\\φ\\«</p>');
	});
});
