declare const UniqueInput: unique symbol;
declare const UniqueOutput: unique symbol;
export interface ParserTypes<Input, Output> {
	[UniqueInput]: Input;
	[UniqueOutput]: Output;
}

export interface FileOptions {
	entry: string;
	minimal?: boolean;
	exclude?: string[];
}

export interface DirOptions<Output extends object = {}> extends FileOptions {
	entry: string;
	recurse?: boolean;
	extensions?: string[];
	sort?(
		x: keyof Output extends never ? Record<string, any> : Output,
		y: keyof Output extends never ? Record<string, any> : Output
	): number;
}
