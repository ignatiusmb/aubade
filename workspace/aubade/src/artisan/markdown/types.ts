export interface BaseToken<T> {
	type: T;
	text?: string;
	attr?: Record<string, string>;
	meta: {
		source: string;
		level?: number;
		[key: string]: any;
	};
}

export interface BlockToken<T> extends BaseToken<T> {
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
	| BaseToken<'inline:link'>
	// | BaseToken<'inline:image'>
	| BaseToken<'inline:autolink'>;
// | BaseToken<'inline:break'>;
