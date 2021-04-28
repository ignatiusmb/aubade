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
export interface FrontMatter extends Record<string, any> {
	date: Record<'created' | 'modified', Date>;
	content?: string | MarquaData[];
}
export type HydrateFn<I, O = I> = (chunk: {
	frontMatter: Pick<FrontMatter, Exclude<keyof FrontMatter, keyof I>> & I;
	content: string;
	breadcrumb: Array<string>;
}) => O | undefined;
