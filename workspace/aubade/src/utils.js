const separators = /[\s\][!"#$%&'()*+,./:;<=>?@\\^_{|}~-]/g;

/** @param {string} source */
export function escape(source) {
	const symbols = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
	return source.replace(/[&<>"']/g, (s) => symbols[/** @type {keyof typeof symbols} */ (s)]);
}

/** @param {string} title */
export function uhi(title) {
	const cleaned = title.toLowerCase().replace(separators, '-');
	const normalized = cleaned.replace(/`/g, '').replace(/-+/g, '-');
	return normalized.replace(/^-*(.+?)-*$/, '$1'); // hyphen at the sides
}
