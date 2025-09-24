import type { Token } from '../artisan/registry.js';
import { engrave } from '../artisan/index.js';
import { parse as manifest } from '../manifest/index.js';

export function assemble(source: string): {
	doc: ReturnType<typeof engrave>;
	manifest: Record<string, any>;
	meta: {
		head: string;
		body: string;
		readonly table: Array<{ id: string; title: string; level: number }>;
		readonly words: number;
	};
} {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(source);
	const body = match ? source.slice(match.index + match[0].length) : source;
	const document = engrave(body.trim());
	return {
		doc: document,
		manifest: match ? (manifest(match[1].trim()) as Record<string, any>) : {},
		meta: {
			head: match ? match[0] : '',
			body: body.trim() + '\n',

			get table() {
				const toc: Array<{ id: string; title: string; level: number }> = [];
				for (const token of document.tokens) {
					if (token.type !== 'block:heading') continue;
					toc.push({
						id: token.attr.id,
						title: token.meta.text,
						level: token.meta.level,
					});
				}
				return toc;
			},

			get words() {
				return count(document.tokens);
				function count(tokens: Token[]): number {
					let total = 0;
					for (const token of tokens) {
						if ('children' in token) total += count(token.children);
						else if ('text' in token) total += token.text.split(/\s+/).length;
					}
					return total;
				}
			},
		},
	};
}
