import { getHighlighter, bundledLanguages } from 'shikiji';
import { escape } from '../utils.js';

/**
 * @typedef {{
 * 	file?: string;
 * 	language?: string;
 * 	[data: string]: string | undefined;
 * }} Dataset
 */

export const highlighter = await getHighlighter({
	themes: ['github-dark'],
	langs: Object.keys(bundledLanguages),
});

/**
 * @param {string} source
 * @param {Dataset} dataset
 * @returns {string} HTML code block
 */
export function transform(source, dataset) {
	const { codeToThemedTokens } = highlighter;
	const { file, ...rest } = dataset;

	let highlighted = '';
	let line = +(rest['line-start'] || 1);
	for (const tokens of codeToThemedTokens(source, { lang: rest.language })) {
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

/**
 * @param {'clipboard' | 'list'} name
 * @param {string} tooltip
 */
function icon(name, tooltip) {
	const span = `<span data-mrq="tooltip" class="mrq">${tooltip}</span>`;
	return `<button data-mrq-toolbar="${name}" class="mrq">${span}</button>`;
}
