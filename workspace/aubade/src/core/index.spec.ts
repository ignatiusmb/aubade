import { describe } from 'vitest';
import { assemble } from './index.js';

describe('assemble', ({ concurrent: it }) => {
	it('markdown file', ({ expect }) => {
		const { manifest, meta } = assemble(
			[
				'---',
				'title: Hello Parser',
				'---',
				'', // empty line
				'Welcome to the contents',
			].join('\n'),
		);

		expect(manifest).toEqual({ title: 'Hello Parser' });
		expect(meta.head).toBe('---\ntitle: Hello Parser\n---');
		expect(meta.body).toBe('Welcome to the contents\n');
		expect(meta.table).toEqual([]);
		expect(meta.words).toBe(4);
	});

	describe('.table', ({ concurrent: it }) => {
		it('generate hash from delimited heading', { todo: true }, ({ expect }) => {
			const { meta } = assemble(
				[
					'---',
					'title: Hello Parser',
					'rating: [8, 7, 9]',
					'---',
					'',
					'## !{rating:0}/10 | $(story & plot)',
					'',
					'story and plot contents',
				].join('\n'),
			);

			expect(meta.table[0]).toEqual({ id: 'story-plot', title: '8/10 | story & plot', level: 2 });
		});

		it('fill sections as expected', ({ expect }) => {
			const { meta } = assemble(
				[
					'---',
					'title: Hello Parser',
					'rating: [8, 7, 9]',
					'---',
					'',
					'## simple heading',
					'',
					'simple contents',
					'',
					'## story & plot',
					'',
					'story and plot',
					'',
					'### sub-story',
					'',
					'sub-story contents',
					'',
					'#### smallest heading',
					'',
					'something here',
					'',
					'### sub-plot',
				].join('\n'),
			);

			expect(meta.table[0]).toEqual({
				id: 'simple-heading',
				title: 'simple heading',
				level: 2,
			});
			expect(meta.table[1]).toEqual({
				id: 'story-plot',
				title: 'story & plot',
				level: 2,
			});
			expect(meta.table[2]).toEqual({
				id: 'story-plot-sub-story',
				title: 'sub-story',
				level: 3,
			});
			expect(meta.table[3]).toEqual({
				id: 'story-plot-sub-story-smallest-heading',
				title: 'smallest heading',
				level: 4,
			});
			expect(meta.table[4]).toEqual({
				id: 'story-plot-sub-plot',
				title: 'sub-plot',
				level: 3,
			});
		});
	});
});
