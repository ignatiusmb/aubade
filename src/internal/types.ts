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

export interface MarquaTable {
	id: string;
	title: string;
	sections?: Array<this>;
}

export interface MarquaData {
	date: Record<'created' | 'modified', Date>;
	content?: string;
}

export type HydrateFn<I, O = I> = (chunk: {
	frontMatter: Pick<MarquaData, Exclude<keyof MarquaData, keyof I>> & I;
	content: string;
	breadcrumb: Array<string>;
}) => O | undefined;
