import markdown from 'markdown-it';
import { uhi } from '../../utils.js';
import { transform } from '../palette/index.js';

export const marker = markdown({
	html: true,
	typographer: true,
	highlight(source, language) {
		const content: string[] = [];
		const dataset: Record<string, string> = { language };
		for (const line of source.split('\n')) {
			const match = line.match(/^#\$ (\w+): (.+)/);
			if (!match) content.push(line);
			else dataset[match[1]] = match[2]?.trim() || '';
		}
		return transform(content.join('\n').trim(), dataset);
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
			media.data = `<video controls><source src="${link}" type="video/mp4"></video>`;
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

	media.data = `<div class="${classes.div.join(' ')}">${media.data}</div>`;
	const rendered = marker.renderInline(caption);
	if (mAttrs.has('disclosure')) {
		const body = `<summary>${rendered}</summary>${media.data}`;
		return `<details class="${classes.top.join(' ')}">${body}</details>`;
	} else {
		const body = `${media.data}<figcaption>${rendered}</figcaption>`;
		return `<figure class="${classes.top.join(' ')}">${body}</figure>`;
	}
};
