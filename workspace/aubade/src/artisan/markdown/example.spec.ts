import { describe } from 'vitest';
import { markdown } from './index.js';

const marker = markdown();

describe('spec', ({ concurrent: it }) => {
	it.skip('#12', ({ expect }) => {
		const { html } = marker(
			'\\!\\"\\#\\$\\%\\&\\\'\\(\\)\\*\\+\\,\\-\\.\\/\\:\\;\\<\\=\\>\\?\\@\\[\\\\\\]\\^\\_\\`\\{\\|\\}\\~',
		);

		// const { text } = root.children[0]?.children[0];
		// expect(text).toBe("<p>!&quot;#$%&amp;'()*+,-./:;&lt;=&gt;?@[]^_`{|}~</p>");

		// https://spec.commonmark.org/0.31.2/#example-12 - adjusted test
		expect(html()).toBe('<p>!&quot;#$%&amp;&#39;()*+,-./:;&lt;=&gt;?@[\\]^_`{|}~</p>');
	});

	it('#13', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-13
		expect(marker('\\→\\A\\a\\ \\3\\φ\\«').html()).toBe('<p>\\→\\A\\a\\ \\3\\φ\\«</p>');
	});

	it('#43', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-43
		expect(marker('***').html()).toBe('<hr />');
		expect(marker('---').html()).toBe('<hr />');
		expect(marker('___').html()).toBe('<hr />');
		expect(marker('***\n---\n___').html()).toBe('<hr />\n<hr />\n<hr />');
	});

	it('#44', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-44
		expect(marker('+++').html()).toBe('<p>+++</p>');
	});

	it('#45', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-45
		expect(marker('===').html()).toBe('<p>===</p>');
	});

	it('#46', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-46
		expect(marker('**\n--\n__').html()).toBe('<p>**\n--\n__</p>');
	});

	it('#58', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-58
		expect(marker('foo\n***\nbar').html()).toBe('<p>foo</p>\n<hr />\n<p>bar</p>');
	});

	it.skip('#149', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-149
		expect(
			marker(`<table>
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
		expect(marker('`code`').html()).toBe('<p><code>code</code></p>');
	});

	it('#329', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-329
		expect(marker('`` code with `backticks ``').html()).toBe(
			'<p><code>code with `backticks</code></p>',
		);
	});

	it.skip('#330', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-330
		expect(marker('` `` `').html()).toBe('<p><code>``</code></p>');
	});

	it('#341', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-341
		expect(marker('*foo`*`').html()).toBe('<p>*foo<code>*</code></p>');
	});

	it('#342', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-342
		expect(marker('[not a `link](/foo`)').html()).toBe('<p>[not a <code>link](/foo</code>)</p>');
	});

	it('#343', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-343
		expect(marker('`<a href="`">`').html()).toBe(
			'<p><code>&lt;a href=&quot;</code>&quot;&gt;`</p>',
		);
	});

	it.skip('#379', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-379
		expect(marker('** foo bar**').html()).toBe('<p>** foo bar**</p>');
	});

	it('#482', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-482
		expect(marker('[link](/uri "title")').html(), '<p><a href="/uri" title="title">link</a></p>');
	});
});
