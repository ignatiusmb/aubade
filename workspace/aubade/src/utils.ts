const separators = /[\s\][!"#$%&'()*+,./:;<=>?@\\^_{|}~-]/g;

export function escape(source: string) {
	const symbols = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
	return source.replace(/[&<>"']/g, (s) => symbols[s as keyof typeof symbols]);
}

export function uhi(title: string) {
	const cleaned = title.toLowerCase().replace(separators, '-');
	const normalized = cleaned.replace(/`/g, '').replace(/-+/g, '-');
	return normalized.replace(/^-*(.+?)-*$/, '$1'); // hyphen at the sides
}
