import { describe } from 'vitest';
import { engrave, forge } from './index.js';

describe('comments', ({ concurrent: it }) => {
	it('block', ({ expect }) => {
		expect(engrave('<!-- comment -->').tokens).toEqual([
			{ type: 'aubade:comment', text: 'comment' },
		]);

		expect(engrave('<!-- comment -->').html()).toBe('');
		expect(engrave('<!-- comment with -- is fine -->').html()).toBe('');
	});

	it('inline', ({ expect }) => {
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
});

describe.skip('directives', ({ concurrent: it }) => {
	it;
});

describe.skip('fences', ({ concurrent: it }) => {
	it;
});

describe('HTML', ({ concurrent: it }) => {
	it('original #21', ({ expect }) => {
		// https://spec.commonmark.org/0.31.2/#example-21
		expect(engrave('<a href="/bar\\/)">').html()).toBe(
			'<p>&lt;a href=&quot;/bar\\/)&quot;&gt;</p>',
		);
	});

	it('treated as text', ({ expect }) => {
		expect(engrave('<p>hello').html()).toBe('<p>&lt;p&gt;hello</p>');
	});
});

describe('misc', ({ concurrent: it }) => {
	it('inline break', ({ expect }) => {
		const engrave = forge({
			renderer: { 'inline:break': () => '<br />' },
		});

		expect(engrave('hello\nworld').tokens[0]).toEqual({
			type: 'block:paragraph',
			children: [
				{ type: 'inline:text', text: 'hello' },
				{ type: 'inline:break' },
				{ type: 'inline:text', text: 'world' },
			],
		});
		expect(engrave('hello\nworld').html()).toBe('<p>hello<br />world</p>');
	});
});
