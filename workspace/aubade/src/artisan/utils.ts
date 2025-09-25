export function decode(cpt: number): string {
	if (cpt === 0x00 || cpt > 0x10ffff) return '\uFFFD'; // HTML5 replacement character
	if (cpt >= 0xd800 && cpt <= 0xdfff) return '\uFFFD'; // surrogate pair range
	if ((cpt >= 0xfdd0 && cpt <= 0xfdef) || (cpt & 0xfffe) === 0xfffe) return '\uFFFD'; // non-characters
	return String.fromCodePoint(cpt);
}

export function escape(source: string) {
	const symbols = { '<': '&lt;', '>': '&gt;', '"': '&quot;' };
	return source
		.replace(/&#([0-9]{1,7});/g, (_, dec) => decode(Number(dec)))
		.replace(/&#[xX]([0-9a-fA-F]{1,6});/g, (_, hex) => decode(parseInt(hex, 16)))
		.replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,31}|#[0-9]{1,7}|#x[0-9a-fA-F]{1,6});)/g, '&amp;')
		.replace(/[<>"]/g, (s) => symbols[s as keyof typeof symbols]);
}
