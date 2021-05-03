/** Option Types */
export interface FileOptions {
	entry: string;
	minimal?: boolean;
	exclude?: Array<string>;
}
export interface DirOptions extends FileOptions {
	entry: string;
	recurse?: boolean;
	extensions?: Array<string>;
}
export interface ParserTypes<Input, Output> {
	Symbol(): Input;
	Symbol(): Output;
}

/** Data Types */
export interface MarquaData {
	type: string;
	title: string;
	body: string | Array<this>;
}
export interface MarquaTable {
	id: string;
	title: string;
	sections?: Array<this>;
}

/** Parser Types */
export interface FrontMatter {
	toc?: Array<MarquaTable>;
	read_time?: number;
	content?: string | Array<MarquaData>;
	date: Record<'created' | 'modified', Date> &
		Partial<Record<'published' | 'updated', string | Date>>;
}
export type HydrateFn<Options extends FileOptions, Input, Output = Input> = (chunk: {
	frontMatter: Input extends unknown
		? Pick<FrontMatter, Exclude<keyof FrontMatter, 'content'>> & Record<string, any>
		: Pick<FrontMatter, Exclude<keyof FrontMatter, 'content' | keyof Input>> & Input;
	content: Options['minimal'] extends true ? string : Array<MarquaData>;
	breadcrumb: Array<string>;
}) => void | Output;
