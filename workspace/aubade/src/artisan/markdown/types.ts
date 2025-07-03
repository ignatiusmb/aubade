interface WithAttr {
	'parent:heading': { id: string };
	'inline:autolink': { href: string };
	'inline:image': { src: string; alt: string; title: string };
	'inline:link': { href: string; title: string };
}

interface TokenMeta {
	'parent:heading': { level: number };
}

export interface BaseToken<T> {
	type: T;
	text?: string;
	meta: { source: string } & (T extends keyof TokenMeta ? TokenMeta[T] : {});
}

export interface AttrToken<T> extends BaseToken<T> {
	attr: T extends keyof WithAttr ? WithAttr[T] : Record<string, string>;
}

export interface BlockToken<T> extends AttrToken<T> {
	children: Token[];
}

// ordered by precedence
export type Block =
	| BlockToken<':document'>
	| BlockToken<'parent:html'>
	| BlockToken<'block:code'> // swallows everything until closing fence
	| BlockToken<'parent:heading'>
	| BlockToken<'parent:quote'>
	// | BlockToken<'block:image'>
	| BlockToken<'block:list'>
	// | BlockToken<'parent:item'>
	// | BlockToken<'block:table'>
	// | BlockToken<'block:row'>
	// | BlockToken<'parent:cell'>
	// | BlockToken<'parent:footnote'>
	| BlockToken<'parent:paragraph'>
	// --- inline with children ---
	| BlockToken<'inline:strong'>
	| BlockToken<'inline:emphasis'>
	| BlockToken<'inline:strike'>;

export type Token =
	| Block
	// | BaseToken<':linefeed'>
	| BaseToken<':comment'>
	| BaseToken<'block:break'>
	// | AttrToken<'block:image'>
	// --- inline tokens ---
	| BaseToken<'inline:text'>
	| BaseToken<'inline:code'>
	| AttrToken<'inline:autolink'>
	| AttrToken<'inline:image'>
	| AttrToken<'inline:link'>;
// | BaseToken<'inline:break'>
