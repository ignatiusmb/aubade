import markdown from 'markdown-it';
import { escape } from '../artisan/utils.js';
import { highlight } from '../palette/index.js';

export const marker = markdown({
	html: true,
	typographer: true,
	highlight(source, language, attributes) {
		const dataset: Record<string, string | undefined> = { file: '', language };
		for (const attr of attributes.split(';')) {
			if (!attr.trim()) continue;
			const separator = attr.indexOf(':');
			const pair = separator !== -1;
			const key = pair ? attr.slice(0, separator) : attr;
			const val = pair ? attr.slice(separator + 1) : '';
			dataset[key.trim()] = val.trim() || undefined;
		}
		const attrs = Object.entries(dataset).flatMap(([k, v]) => {
			if (k === 'file') return `data-file="${escape(v || 'empty')}"`;
			const name = k.toLowerCase().replace(/[^a-z\-]/g, '');
			if (!name) return [];
			if (v == null) return `data-${name}`;
			return `data-${name}="${escape(v)}"`;
		});

		return [
			// needs to start with `<pre` to prevent added wrapper
			'<pre data-aubade="block">',
			`<header data-aubade="header" ${attrs.join(' ')}>`,
			dataset.file ? `<span>${dataset.file}</span>` : '',
			'<div data-aubade="toolbar">',
			`<button data-aubade-toolbar="copy" data-aubade-tooltip="Copy"></button>`,
			`<button data-aubade-toolbar="list" data-aubade-tooltip="Toggle\nNumbering"></button>`,
			'</div>',
			'</header>',
			`<div data-aubade="pre" ${attrs.join(' ')}>${highlight(source, dataset)}</div>`,
			'</pre>',
		].join('');
	},
});

// Renderer Override Rules
/** @type {typeof marker['renderer']['rules']['html_block']} */
marker.renderer.rules.heading_open = (() => {
	let parents = ['', ''];

	return (tokens, idx) => {
		const [token, text] = [tokens[idx], tokens[idx + 1].content];
		const level = +token.tag.slice(-1);
		if (level > 4) return `<${token.tag}>`;
		const [delimited] = text.match(/\$\(.*?\)/) || [''];
		const id = uhi(delimited.slice(2, -1) || text);

		if (level === 2) parents = [id];
		if (level === 3) parents = [parents[0], id];
		if (level === 4) parents[2] = id;
		const uid = parents.filter((p) => p).join('-');
		return `<${token.tag} id="${uid}">`;
	};
})();
/** @type {typeof marker['renderer']['rules']['image']} */
marker.renderer.rules.image = (tokens, idx, options, env, self) => {
	const token = tokens[idx];
	const link = token.attrGet('src');
	if (!token.attrs || !token.children || !link) return '';
	token.attrPush(['loading', 'lazy']); // add browser level lazy loading
	token.attrSet('alt', self.renderInlineAsText(token.children, options, env));

	const title = token.attrIndex('title');
	if (title === -1) return `<img ${self.renderAttrs(token)}>`;
	// Remove caption so it's not rendered in else block below
	const caption = token.attrs.splice(title, 1)[0][1];
	const alt = token.attrGet('alt') || '';
	const media = {
		data: '',
		type: (alt.match(/^!(\w+[-\w]+)($|#)/) || [, ''])[1],
		attrs: (alt.match(/#(\w+)/g) || []).map((a) => a.slice(1)),
	};

	if (media.type) {
		const stripped = media.type.toLowerCase();
		const [type, ...args] = stripped.split('-');
		if (['yt', 'youtube'].includes(type)) {
			const [, yid, params = ''] = link.match(/([-\w]+)\??(.+)?$/) || [];
			const prefix = args.length && args.includes('s') ? 'videoseries?list=' : '';
			media.data = prefix
				? `<iframe src="https://www.youtube-nocookie.com/embed/${prefix}${link}" frameborder="0" allowfullscreen title="${caption}"></iframe>`
				: `<iframe src="https://www.youtube-nocookie.com/embed/${yid}" srcdoc="<style>*{padding:0;margin:0;overflow:hidden;transition:300ms}html,body{height:100%}a,span{display:flex;align-items:center;justify-content:center}img,span{position:absolute;width:100%;top:0;bottom:0;margin:auto}span{width:5rem;height:5rem;font-size:3rem;color:white;text-shadow:0 0 0.5rem black;background:rgba(0,0,0,0.8);border-radius:50%;padding:0.25rem 0 0.25rem 0.5rem}a:hover span{background:rgb(255,0,0)}</style><a href=https://www.youtube-nocookie.com/embed/${yid}?autoplay=1&${params}><img src=https://img.youtube.com/vi/${yid}/hqdefault.jpg alt='${caption}'><span>&#x25BA;</span></a>" frameborder="0" allowfullscreen title="${caption}"></iframe>`;
		} else if (['video'].includes(type)) {
			media.data = `<video controls>\n<source src="${link}" type="video/mp4">\n</video>`;
		}
	} else {
		token.attrSet('alt', alt.replace(/#\w+/g, ''));
		media.data = `<img ${self.renderAttrs(token)}>`;
	}

	const classMap = new Map([
		['d', 'disclosure'],
		['f', 'flexible'],
		['bo', 'breakout'],
		['fb', 'full-bleed'],
	]);
	const mAttrs = new Set(media.attrs.map((a) => classMap.get(a) || a));
	const classes = {
		div: ['captioned', ['flexible'].filter((c) => mAttrs.has(c))].flat(),
		top: ['breakout', 'full-bleed'].filter((c) => mAttrs.has(c)),
	};

	media.data = `<div class="${classes.div.join(' ')}">\n${media.data}\n</div>`;
	const rendered = marker.renderInline(caption);
	if (mAttrs.has('disclosure')) {
		const body = `\n<summary>${rendered}</summary>\n${media.data}\n`;
		return `<details class="${classes.top.join(' ')}">${body}</details>`;
	} else {
		const body = `\n${media.data}\n<figcaption>${rendered}</figcaption>\n`;
		return `<figure class="${classes.top.join(' ')}">${body}</figure>`;
	}
};

const separators = /[\s\][!"#$%&'()*+,./:;<=>?@\\^_{|}~-]/g;
function uhi(title: string) {
	const cleaned = title.toLowerCase().replace(separators, '-');
	const normalized = cleaned.replace(/`/g, '').replace(/-+/g, '-');
	return normalized.replace(/^-*(.+?)-*$/, '$1'); // hyphen at the sides
}
