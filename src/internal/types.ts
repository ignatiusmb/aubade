export interface FileOptions {
	entry: string;
	minimal?: boolean;
	exclude?: Array<string>;
}
export interface DirOptions extends FileOptions {
	entry: string;
	extensions?: Array<string>;
}

export interface HydrateFn<I, O = I> {
	(data: { frontMatter: I; content: string; filename: string }): O | undefined;
}

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
