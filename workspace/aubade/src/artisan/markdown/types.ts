interface WithAttr {
	'parent:heading': { id: string };
	'inline:link': { href: string; title: string };
	'inline:autolink': { href: string };
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

export type Block =
	| BlockToken<':document'>
	| BlockToken<'parent:html'>
	| BlockToken<'parent:heading'>
	| BlockToken<'parent:quote'>
	| BlockToken<'block:code'>
	| BlockToken<'block:list'>
	// | BlockToken<'parent:item'>
	| BlockToken<'parent:paragraph'>
	// | BlockToken<'block:table'>
	// | BlockToken<'block:row'>
	// | BlockToken<'parent:cell'>
	// | BlockToken<'parent:footnote'>
	| BlockToken<'inline:strong'>
	| BlockToken<'inline:emphasis'>
	| BlockToken<'inline:strike'>;

export type Token =
	| Block
	// | BaseToken<':linefeed'>
	| BaseToken<':comment'>
	| BaseToken<'block:break'>
	// --- inline tokens ---
	| BaseToken<'inline:text'>
	| BaseToken<'inline:code'>
	| AttrToken<'inline:link'>
	// | BaseToken<'inline:image'>
	| AttrToken<'inline:autolink'>;
// | BaseToken<'inline:break'>;
