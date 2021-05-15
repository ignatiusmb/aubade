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
