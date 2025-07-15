import { describe } from 'vitest';
import { engrave } from './index.js';

describe('afm', ({ concurrent: it }) => {
	describe('comments', ({ concurrent: it }) => {
		it('block', ({ expect }) => {
			expect(engrave('<!-- comment -->').tokens).toEqual([
				{ type: 'inline:comment', text: 'comment' },
			]);

			expect(engrave('<!-- comment -->').html()).toBe('');
			expect(engrave('<!-- comment with -- is fine -->').html()).toBe('');
		});

		it('inline', ({ expect }) => {
			expect(engrave('hello <!-- comment --> world').tokens[0]).toEqual({
				type: 'parent:paragraph',
				children: [
					{ type: 'inline:text', text: 'hello ' },
					{ type: 'inline:comment', text: 'comment' },
					{ type: 'inline:text', text: ' world' },
				],
			});

			expect(engrave('hello <!-- comment --> world').html()).toBe('<p>hello  world</p>');
			expect(engrave('hello <!-- comment --> world -->').html()).toBe('<p>hello  world --&gt;</p>');
			expect(engrave('hello <!-- comment world').html()).toBe('<p>hello &lt;!-- comment world</p>');
		});
	});

	it('directives', ({ expect }) => {
		expect;
	});

	it('fences', ({ expect }) => {
		expect;
	});
});
