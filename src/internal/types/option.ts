declare const UniqueInput: unique symbol;
declare const UniqueOutput: unique symbol;
export type ParserTypes<Input, Output> = {
	[UniqueInput]: Input;
	[UniqueOutput]: Output;
};

export type FileOptions = {
	entry: string;
	minimal?: boolean;
	exclude?: Array<string>;
};

export type DirOptions<Output extends object = {}> = FileOptions & {
	entry: string;
	recurse?: boolean;
	extensions?: Array<string>;
	sort?(
		x: keyof Output extends never ? Record<string, any> : Output,
		y: keyof Output extends never ? Record<string, any> : Output
	): number;
};
