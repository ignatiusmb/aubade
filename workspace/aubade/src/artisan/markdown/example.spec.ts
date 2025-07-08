import { describe } from 'vitest';
import { engrave } from './index.js';

describe('spec', ({ concurrent: it }) => {
	it.skip('#12', ({ expect }) => {
		const { html } = engrave(
			'\\!\\"\\#\\$\\%\\&\\\'\\(\\)\\*\\+\\,\\-\\.\\/\\:\\;\\<\\=\\>\\?\\@\\[\\\\\\]\\^\\_\\`\\{\\|\\}\\~',
		);

		// const { text } = root.children[0]?.children[0];
		// expect(text).toBe("<p>!&quot;#$%&amp;'()*+,-./:;&lt;=&gt;?@[]^_`{|}~</p>");

		// https://spec.commonmark.org/0.31.2/#example-12 - adjusted test
		expect(html()).toBe('<p>!&quot;#$%&amp;&#39;()*+,-./:;&lt;=&gt;?@[\\]^_`{|}~</p>');
	});

	it('#13', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-13
		expect(engrave('\\→\\A\\a\\ \\3\\φ\\«').html()).toBe('<p>\\→\\A\\a\\ \\3\\φ\\«</p>');
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

	it('#58', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-58
		expect(engrave('foo\n***\nbar').html()).toBe('<p>foo</p>\n<hr />\n<p>bar</p>');
	});

	it.skip('#149', ({ expect }) => {
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

	it.skip('#330', ({ expect }) => {
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

	it('#482', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-482
		expect(engrave('[link](/uri "title")').html(), '<p><a href="/uri" title="title">link</a></p>');
	});
});
