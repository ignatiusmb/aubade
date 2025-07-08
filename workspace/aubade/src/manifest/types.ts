export type Primitives = string | boolean | null;

export interface FrontMatter {
	[key: string]: Primitives | Primitives[] | FrontMatter | FrontMatter[];
}
