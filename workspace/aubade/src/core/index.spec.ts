import { describe } from 'vitest';
import { parse } from './index.js';

describe('parse', ({ concurrent: it }) => {
	it('markdown file', ({ expect }) => {
		const { body, frontmatter } = parse(
			`
---
title: Hello Parser
---

Welcome to the contents
		`.trim(),
		);

		expect(frontmatter).toEqual({
			title: 'Hello Parser',
			estimate: 1,
			table: [],
		});

		expect(body.trim(), 'Welcome to the contents');
	});

	describe('.table', ({ concurrent: it }) => {
		it('generate hash from delimited heading', ({ expect }) => {
			const { frontmatter } = parse(
				`
---
title: Hello Parser
rating: [8, 7, 9]
---

## !{rating:0}/10 | $(story & plot)

story and plot contents
		`.trim(),
			);

			expect(frontmatter?.table).toEqual([
				{
					id: 'story-plot',
					level: 2,
					title: '8/10 | story & plot',
				},
			]);
		});
		it('fill sections as expected', ({ expect }) => {
			const { frontmatter } = parse(
				`
---
title: Hello Parser
rating: [8, 7, 9]
---

## simple heading

simple contents

## story & plot

story and plot

### sub-story

sub-story contents

#### smallest heading

something here

### sub-plot
		`.trim(),
			);

			expect(frontmatter?.table[0]).toEqual({
				id: 'simple-heading',
				level: 2,
				title: 'simple heading',
			});
			expect(frontmatter?.table[1]).toEqual({
				id: 'story-plot',
				level: 2,
				title: 'story & plot',
			});
			expect(frontmatter?.table[2]).toEqual({
				id: 'story-plot-sub-story',
				level: 3,
				title: 'sub-story',
			});
			expect(frontmatter?.table[3]).toEqual({
				id: 'story-plot-sub-story-smallest-heading',
				level: 4,
				title: 'smallest heading',
			});
			expect(frontmatter?.table[4]).toEqual({
				id: 'story-plot-sub-plot',
				level: 3,
				title: 'sub-plot',
			});
		});
		it('trim comments correctly', ({ expect }) => {
			const { frontmatter } = parse(
				`
---
title: headings inside comments
---

## simple heading

### story

<!--
### plot
-->

### sub-story

### sub-plot
		`.trim(),
			);

			expect(frontmatter?.table.length).toEqual(4);
		});
	});
});
