export function escape(source: string) {
	const symbols = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
	return source.replace(/[&<>"']/g, (s) => symbols[s as keyof typeof symbols]);
}
