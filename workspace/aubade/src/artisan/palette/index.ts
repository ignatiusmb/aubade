import { createHighlighter, bundledLanguages } from 'shiki';
import { escape } from '../utils.js';

interface Dataset {
	file?: string;
	language?: string;
	[data: string]: string | undefined;
}

export const highlighter = await createHighlighter({
	themes: ['github-dark'],
	langs: Object.keys(bundledLanguages),
});

export function transform(source: string, dataset: Dataset): string {
	const { codeToTokensBase } = highlighter;
	const { file, ...rest } = dataset;

	let highlighted = '';
	let line = +(rest['line-start'] || 1);
	for (const tokens of codeToTokensBase(source, {
		lang: rest.language as import('shiki').BundledLanguage,
	})) {
		let code = `<code data-line="${line++}">`;
		for (const { content, color } of tokens) {
			const style = color ? `style="color: ${color}"` : '';
			code += `<span ${style}>${escape(content)}</span>`;
		}
		highlighted += `${code}</code>\n`;
	}

	const attrs = Object.entries(rest).map(
		([k, v]) => `data-${k.toLowerCase().replace(/[^a-z\-]/g, '')}="${escape(v || '')}"`,
	);

	// @TODO: rename `data-mrq` to `data-aubade`
	// needs to be /^<pre/ to prevent added wrapper from markdown-it
	return `<pre data-mrq="block" class="mrq">
	<header
		data-mrq="header"
		${attrs.join('\n\t\t')}
		class="mrq ${file ? '' : 'empty'}"
	>${file ? `<span>${file}</span>` : ''}
		<div data-mrq="toolbar" class="mrq">
			${icon('list', 'Toggle\nNumbering')}
			${icon('clipboard', 'Copy')}
		</div>
	</header>

	<div
		data-mrq="pre"
		${attrs.join('\n\t\t')}
		class="mrq language-${rest.language || 'none'}"
	>${highlighted.trim()}</div>
</pre>`;
}

function icon(name: 'clipboard' | 'list', tooltip: string) {
	const span = `<span data-mrq="tooltip" class="mrq">${tooltip}</span>`;
	return `<button data-mrq-toolbar="${name}" class="mrq">${span}</button>`;
}
