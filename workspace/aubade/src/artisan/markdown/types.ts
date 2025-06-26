export interface TextToken<T> {
	type: T;
	tag: string;
	text: string;
	render(): string;
}

export interface DataToken<T> extends TextToken<T> {
	data: Record<string, any>;
}

export type Token =
	| TextToken<':linefeed'>
	| TextToken<':comment'>
	// | DataToken<':document'>
	| TextToken<'block:html'>
	| DataToken<'block:heading'>
	| TextToken<'block:paragraph'>
	| TextToken<'block:quote'>
	| DataToken<'block:code'>
	| DataToken<'block:list'>
	// | DataToken<'block:list:item'>
	| TextToken<'block:break'>
	// | TextToken<'block:table'>
	// | TextToken<'block:table:row'>
	// | TextToken<'block:table:cell'>
	// --- inline tokens ---
	| TextToken<'inline:text'>
	| TextToken<'inline:strong'>
	| TextToken<'inline:emphasis'>
	| TextToken<'inline:strike'>
	| TextToken<'inline:code'>
	| TextToken<'inline:link'>
	// | TextToken<'inline:image'>
	| TextToken<'inline:autolink'>;
// | TextToken<'inline:break'>;
