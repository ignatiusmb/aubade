import type { Typify } from 'mauss/typings';

/** Option Types */
declare const UnSym1: unique symbol;
declare const UnSym2: unique symbol;
export type ParserTypes<Input, Output> = {
	[UnSym1]: Input;
	[UnSym2]: Output;
};
export type FileOptions = {
	entry: string;
	minimal?: boolean;
	exclude?: Array<string>;
};
export type DirOptions = FileOptions & {
	entry: string;
	recurse?: boolean;
	extensions?: Array<string>;
};

/** Data Types */
export type MarquaData = Typify<{
	type: string;
	title: string;
	body: string | Array<MarquaData>;
}>;
export type MarquaTable = Typify<{
	id: string;
	title: string;
	sections?: Array<MarquaTable>;
}>;

/** Parser Types */
export type FrontMatter = {
	toc: Array<MarquaTable>;
	read_time: number;
	content?: string | Array<MarquaData>;
	date: Record<'created' | 'modified', Date> &
		Partial<Record<'published' | 'updated', string | Date>>;
};
export type HydrateFn<Options extends FileOptions, Input, Output = Input> = (chunk: {
	frontMatter: keyof Input extends never
		? Options['minimal'] extends true
			? Pick<FrontMatter, 'date'> & Record<string, any>
			: Omit<FrontMatter, 'content'> & Record<string, any>
		: Options['minimal'] extends true
		? Pick<FrontMatter, 'date'> & Input
		: Omit<FrontMatter, 'content' | keyof Input> & Input;
	content: Options['minimal'] extends true ? string : Array<MarquaData>;
	breadcrumb: Array<string>;
}) => void | Output;
