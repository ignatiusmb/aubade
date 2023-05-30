const separators = /[\s\][!"#$%&'()*+,./:;<=>?@\\^_{|}~-]/g;

export const generate = {
	icon(name: 'clipboard' | 'list', tooltip: string) {
		const span = `<span data-mrq="tooltip" class="mrq">${tooltip}</span>`;
		return `<button data-mrq-toolbar="${name}" class="mrq">${span}</button>`;
	},
	id(title: string) {
		title = title.toLowerCase().replace(separators, '-');
		title = title.replace(/`/g, '').replace(/-+/g, '-');
		return title.replace(/^-*(.+)-*$/, '$1');
	},
} as const;

export function escape(source: string) {
	const symbols = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as const;
	return source.replace(/[&<>"']/g, (s) => symbols[s as keyof typeof symbols]);
}
