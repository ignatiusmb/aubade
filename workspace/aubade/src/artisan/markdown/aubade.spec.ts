import { describe } from 'vitest';
import { engrave, forge } from './index.js';

describe('extensions', ({ concurrent: it }) => {
	it('block comments', ({ expect }) => {
		expect(engrave('<!-- comment -->').tokens).toEqual([
			{ type: 'aubade:comment', text: 'comment' },
		]);

		expect(engrave('<!-- comment -->').html()).toBe('');
		expect(engrave('<!-- comment with -- is fine -->').html()).toBe('');
	});

	it('inline comments', ({ expect }) => {
		expect(engrave('hello <!-- comment --> world').tokens[0]).toEqual({
			type: 'block:paragraph',
			children: [
				{ type: 'inline:text', text: 'hello ' },
				{ type: 'aubade:comment', text: 'comment' },
				{ type: 'inline:text', text: ' world' },
			],
		});

		expect(engrave('hello <!-- comment --> world').html()).toBe('<p>hello  world</p>');
		expect(engrave('hello <!-- comment --> world -->').html()).toBe('<p>hello  world --&gt;</p>');
		expect(engrave('hello <!-- comment world').html()).toBe('<p>hello &lt;!-- comment world</p>');
	});

	it('leaf image without title', ({ expect }) => {
		expect(engrave('![unannotated *alt* text](img.png)').html()).toBe(
			'<figure>\n<img src="img.png" alt="unannotated *alt* text" />\n</figure>',
		);
	});

	it('leaf image with title', ({ expect }) => {
		expect(engrave('![alt](img.png "annotated *title* for caption")').html()).toBe(
			'<figure>\n<img src="img.png" alt="alt" /><figcaption>annotated <em>title</em> for caption</figcaption>\n</figure>',
		);
	});
});

describe.todo('directives', ({ concurrent: it }) => {
	it;
});

describe.todo('fences', ({ concurrent: it }) => {
	it;
});

describe('HTML', ({ concurrent: it }) => {
	it('original #21', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-21
		expect(engrave('<a href="/bar\\/)">').html()).toBe('<p>&lt;a href=&quot;/bar/)&quot;&gt;</p>');
	});

	it('treated as text', ({ expect }) => {
		expect(engrave('<p>hello').html()).toBe('<p>&lt;p&gt;hello</p>');
	});
});
