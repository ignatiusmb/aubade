import type { Resolver } from '../artisan/index.js';
import { createHighlighter, bundledLanguages } from 'shiki';
import { escape } from '../artisan/utils.js';

interface Dataset {
	file?: string | undefined;
	language?: string | undefined;
	[data: string]: string | undefined;
}

export const shiki = await createHighlighter({
	themes: ['github-dark'],
	langs: Object.keys(bundledLanguages),
});

export function highlight(source: string, dataset: Dataset): string {
	const { codeToTokensBase } = shiki;
	const highlighted: string[] = [];
	for (const tokens of codeToTokensBase(source, {
		lang: dataset.language as import('shiki').BundledLanguage,
	})) {
		let code = '';
		for (const { content, color } of tokens) {
			const style = color ? ` style="color: ${color}"` : '';
			code += `<span${style}>${escape(content)}</span>`;
		}
		highlighted.push(code);
	}

	while (!highlighted[highlighted.length - 1].trim()) highlighted.pop();
	const pre = highlighted.map((code, idx) => {
		const line = +(dataset['start'] || 1) + idx;
		return `<code data-line="${line}">${code}</code>`;
	});

	return pre.join('\n');
}

export const codeblock: Resolver<'block:code'> = ({ token, sanitize }) => {
	const dataset: Record<string, string | undefined> = {
		language: token.attr['data-language'],
		file: '',
	};
	for (const attr of token.meta.info.split(';')) {
		if (!attr.trim()) continue;
		const separator = attr.indexOf(':');
		const pair = separator !== -1;
		const key = pair ? attr.slice(0, separator) : attr;
		const val = pair ? attr.slice(separator + 1) : '';
		dataset[key.trim()] = val.trim() || undefined;
	}
	const attrs = Object.entries(dataset).flatMap(([k, v]) => {
		if (k === 'file') return `data-file="${sanitize(v || 'empty')}"`;
		const name = k.toLowerCase().replace(/[^a-z\-]/g, '');
		if (!name) return [];
		if (v == null) return `data-${name}`;
		return `data-${name}="${sanitize(v)}"`;
	});

	return [
		'<div data-aubade="block">',
		`<header data-aubade="header" ${attrs.join(' ')}>`,
		dataset.file ? `<span>${dataset.file}</span>` : '',
		'<div data-aubade="toolbar">',
		`<button data-aubade-toolbar="copy" data-aubade-tooltip="Copy"></button>`,
		`<button data-aubade-toolbar="list" data-aubade-tooltip="Toggle\nNumbering"></button>`,
		'</div>',
		'</header>',
		`<pre data-aubade="pre">${highlight(token.meta.code, dataset)}</pre>`,
		'</div>',
	].join('');
};
