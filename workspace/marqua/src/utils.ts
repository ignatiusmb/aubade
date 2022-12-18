import { exists } from 'mauss/guards';
import { tryNumber } from 'mauss/utils';

const separators = /[\s\][!"#$%&'()*+,./:;<=>?@\\^_{|}~-]/g;

export const generate = {
	icon(name: 'clipboard' | 'list', tooltip: string) {
		const span = `<span data-mrq="tooltip" class="mrq">${tooltip}</span>`;
		return `<button data-mrq-toolbar="${name}" class="mrq">${span}</button>`;
	},
	id(title: string) {
		title = title.toLowerCase().replace(separators, '-');
		return title.replace(/-+/g, '-').replace(/^-*(.+)-*$/, '$1');
	},
} as const;

export function construct(metadata: string) {
	const lines = metadata.split(/\r?\n/).filter(exists);
	if (!lines.length) return {};

	function drill(
		keys: string[],
		val: string | string[],
		memo: Record<string, any> = {}
	): string | string[] | Record<string, any> {
		if (!keys.length) return Array.isArray(val) ? val.filter(exists) : val;
		return { ...memo, [keys[0]]: drill(keys.slice(1), val, memo[keys[0]]) };
	}

	const ignored = new Set(['title', 'description']);
	return lines.reduce((acc: Record<string, any>, cur) => {
		const match = cur.trim().match(/([:\w]+): (.+)/);
		if (!match || (match && !match[2].trim())) return acc;
		const [key, data] = match.slice(1).map((g) => g.trim());
		const val = /,/.test(data) ? data.split(',').map((v) => v.trim()) : data;
		if (/:/.test(key)) {
			const [attr, ...keys] = key.split(':').filter(exists);
			const initial = ignored.has(attr) ? data : val;
			acc[attr] = drill(keys, initial, acc[attr]);
		} else if (ignored.has(key)) acc[key] = data;
		else acc[key] = Array.isArray(val) ? val.filter(exists) : val;
		return acc;
	}, {});
}

export function escape(source: string) {
	const symbols = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as const;
	return source.replace(/[&<>"']/g, (s) => symbols[s as keyof typeof symbols]);
}

export function supplant(data: Record<string, any>, content: string): string {
	function traverse(meta: string | Record<string, any>, properties: string): string {
		for (const key of properties.split(':')) {
			if (typeof meta === 'string' || !meta) return meta || '';
			meta = meta[tryNumber(key)];
		}
		return typeof meta === 'string' ? meta : JSON.stringify(meta);
	}

	return content.replace(/!{(.+)}/g, (s, c) => (c && traverse(data, c)) || s);
}
