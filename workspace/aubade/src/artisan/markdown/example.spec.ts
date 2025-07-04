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

	it('#351', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-351
		expect(marker('a * foo bar*').html()).toBe('<p>a * foo bar*</p>');
	});

	it('#352', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-352
		expect(marker('a*"foo"*').html()).toBe('<p>a*&quot;foo&quot;*</p>');
	});

	it('#353', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-353
		expect(marker('* a *').html()).toBe('<p>* a *</p>');
	});

	it('#354', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-354
		expect(marker('*$*alpha.').html()).toBe('<p>*$*alpha.</p>');
		expect(marker('*£*bravo.').html()).toBe('<p>*£*bravo.</p>');
		expect(marker('*€*charlie.').html()).toBe('<p>*€*charlie.</p>');
	});

	it('#355', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-355
		expect(marker('foo*bar*').html()).toBe('<p>foo<em>bar</em></p>');
	});

	it('#356', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-356
		expect(marker('5*6*78').html()).toBe('<p>5<em>6</em>78</p>');
	});

	it('#358', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-358
		expect(marker('_ foo bar_').html()).toBe('<p>_ foo bar_</p>');
	});

	it('#359', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-359
		expect(marker('a_"foo"_').html()).toBe('<p>a_&quot;foo&quot;_</p>');
	});

	it.skip('#360', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-359
		expect(marker('foo_bar_').html()).toBe('<p>foo_bar_</p>');
	});

	it('#379', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-379
		expect(marker('** foo bar**').html()).toBe('<p>** foo bar**</p>');
	});

	it('#482', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-482
		expect(marker('[link](/uri "title")').html(), '<p><a href="/uri" title="title">link</a></p>');
	});
});
