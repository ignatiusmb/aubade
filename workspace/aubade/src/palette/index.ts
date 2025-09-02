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

	let highlighted = '';
	let line = +(dataset['line-start'] || 1);
	for (const tokens of codeToTokensBase(source, {
		lang: dataset.language as import('shiki').BundledLanguage,
	})) {
		let code = `<code data-line="${line++}">`;
		for (const { content, color } of tokens) {
			const style = color ? ` style="color: ${color}"` : '';
			code += `<span${style}>${escape(content)}</span>`;
		}
		highlighted += `${code}</code>\n`;
	}

	const attrs = Object.entries(dataset).map(([k, v]) => {
		if (k === 'file') return `data-file="${escape(v || 'empty')}"`;
		const name = k.toLowerCase().replace(/[^a-z\-]/g, '');
		if (v == null) return `data-${name}`;
		return `data-${name}="${escape(v)}"`;
	});

	// needs to be /^<pre/ to prevent added wrapper from markdown-it
	return [
		'<pre data-aubade="block">',
		`<header data-aubade="header" ${attrs.join(' ')}>`,
		dataset.file ? `<span>${dataset.file}</span>` : '',
		'<div data-aubade="toolbar">',
		icon('copy', 'Copy'),
		icon('list', 'Toggle\nNumbering'),
		'</div>',
		'</header>',
		`<div data-aubade="pre" ${attrs.join(' ')}>${highlighted.trim()}</div>`,
		'</pre>',
	].join('');
}

function icon(name: 'copy' | 'list', tooltip: string) {
	const span = `<span data-aubade="tooltip">${tooltip}</span>`;
	return `<button data-aubade-toolbar="${name}">${span}</button>`;
}
