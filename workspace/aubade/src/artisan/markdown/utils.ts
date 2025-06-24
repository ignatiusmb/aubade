const separators = /[\s\][!"#$%&'()*+,./:;<=>?@\\^_{|}~-]/g;

export function uhi(title: string) {
	const cleaned = title.toLowerCase().replace(separators, '-');
	const normalized = cleaned.replace(/`/g, '').replace(/-+/g, '-');
	return normalized.replace(/^-*(.+?)-*$/, '$1'); // hyphen at the sides
}
