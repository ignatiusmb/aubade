import { getHighlighter } from 'shiki';
import { escape, generate } from '../utils.js';

export interface Dataset {
	language?: string;
	lineStart?: number;
	title?: string;
}

export const highlighter = await getHighlighter({ theme: 'github-dark' });

export function transform(source: string, dataset: Dataset) {
	const { codeToThemedTokens } = highlighter;
	const { language, title, lineStart = 1 } = dataset;

	let highlighted = '';
	let line = lineStart;
	for (const tokens of codeToThemedTokens(source, language)) {
		let code = `<code data-line="${line++}">`;
		for (const { content, color } of tokens) {
			const style = color ? `style="color: ${color}"` : '';
			code += `<span ${style}>${escape(content)}</span>`;
		}
		highlighted += `${code}</code>\n`;
	}

	// needs to be /^<pre/ to prevent added wrapper from markdown-it
	return `<pre data-mrq="block" class="mrq">
	<header 
		data-mrq="header"
		data-language="${language || ''}"
		class="mrq ${title ? '' : 'empty'}"
	>${title ? `<span>${title}</span>` : ''}
		<div data-mrq="toolbar" class="mrq">
			${generate.icon('list', 'Toggle\nNumbering')}
			${generate.icon('clipboard', 'Copy')}
		</div>
	</header>

	<div
		data-mrq="pre"
		data-language="${language || ''}"
		class="mrq language-${language || 'none'}"
	>${highlighted.trim()}</div>
</pre>`;
}
