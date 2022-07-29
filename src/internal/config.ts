import type { DirOptions, FileOptions, ParserTypes } from './types.js';

export const forge = {
	compile: <T extends FileOptions>(options: T) => options,
	traverse: <T extends DirOptions>(options: T) => options,
	types: <Input, Output = Input>(): ParserTypes<Input, Output> => ({} as ParserTypes<never, never>),
};
