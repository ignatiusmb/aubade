export function escape(source: string) {
	const symbols = { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
	return source
		.replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#[0-9]{1,7}|#x[0-9a-fA-F]{1,6});)/g, '&amp;')
		.replace(/[<>"']/g, (s) => symbols[s as keyof typeof symbols]);
}
