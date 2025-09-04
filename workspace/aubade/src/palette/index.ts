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
