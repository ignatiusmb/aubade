import type { Token } from '../artisan/markdown/engine.js';
import { engrave } from '../artisan/index.js';
import { parse as manifest } from '../manifest/index.js';
import { uhi } from '../utils.js';

export function parse(source: string): {
	body: string;
	frontmatter?: {
		[key: string]: any;
		estimate: number;
		table: Array<{
			id: string;
			title: string;
			level: number;
		}>;
	};
} {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(source);
	if (!match) return { body: source };

	const crude = source.slice(match.index + match[0].length);
	const memory = manifest(match[1].trim()) as Record<string, any>;
	const stuffed = inject(crude, memory);

	return {
		body: stuffed.trim(),
		frontmatter: Object.assign(memory, {
			/** estimated reading time */
			get estimate() {
				const paragraphs = stuffed.split('\n').filter(
					(p) => !!p && !/^[!*]/.test(p), // remove empty and not sentences
				);
				const words = paragraphs.reduce((total, line) => {
					if (/^[\t\s]*<.+>/.test(line.trim())) return total + 1;
					const accumulated = line.split(' ').filter((w) => !!w && /\w|\d/.test(w) && w.length > 1);
					return total + accumulated.length;
				}, 0);
				const images = stuffed.match(/!\[.+\]\(.+\)/g);
				const total = words + (images || []).length * 12;
				return Math.round(total / 240) || 1;
			},

			/** table of contents */
			get table() {
				const table: Array<{
					id: string;
					level: number;
					title: string;
				}> = [];
				for (const line of stuffed.replace(/<!--[\s\S]+?-->/g, '').split('\n')) {
					const match = line.trim().match(/^(#{2,4}) (.+)/);
					if (!match) continue;

					const [, hashes, title] = match;
					const [delimited] = title.match(/\$\(.*?\)/) || [''];

					table.push({
						id: uhi(delimited.slice(2, -1) || title),
						title: title.replace(delimited, delimited.slice(2, -1)),
						level: hashes.length,
					});
				}

				let parents = ['', ''];
				for (let i = 0; i < table.length; i++) {
					const { id, level } = table[i];
					if (level === 2) parents = [id];
					if (level === 3) parents = [parents[0], id];
					if (level === 4) parents[2] = id;
					table[i].id = parents.filter((p) => p).join('-');
				}

				return table;
			},
		}),
	};
}

function inject(source: string, metadata: Record<string, any>) {
	const plane = compress(metadata);
	return source.replace(/!{(.+)}/g, (s, c) => (c && plane[c as keyof typeof plane]) || s);
}

function compress(metadata: Record<string, any>, parent = '') {
	const memo: typeof metadata = {};
	const prefix = parent ? `${parent}:` : '';
	for (const [k, v] of Object.entries(metadata)) {
		if (typeof v !== 'object') memo[prefix + k] = v;
		else Object.assign(memo, compress(v, k));
	}
	return memo;
}

export function assemble(source: string): {
	manifest?: Record<string, any>;
	md: ReturnType<typeof engrave>;
	meta: { body: string; words: number };
} {
	const match = /---\r?\n([\s\S]+?)\r?\n---/.exec(source);
	if (!match) {
		const document = engrave(source);
		const meta = { body: source, words: words(document.tokens) };
		return { md: document, meta };
	}

	const body = source.slice(match.index + match[0].length);
	const document = engrave(body);
	return {
		manifest: manifest(match[1].trim()) as Record<string, any>,
		md: document,
		meta: { body, words: words(document.tokens) },
	};
}

function words(tokens: Token[]): number {
	let count = 0;
	for (const token of tokens) {
		switch (token.type) {
			case 'inline:text':
				count += token.text.split(/\s+/).length;
				break;
			case 'parent:paragraph':
				count += words(token.children);
			default:
				break;
		}
	}
	return count;
}
