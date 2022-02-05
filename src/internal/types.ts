import type { Typify } from 'mauss/typings';

export type MarquaData = Typify<{
	type: string;
	title: string;
	body: string | MarquaData[];
}>;

export type MarquaTable = Typify<{
	id: string;
	title: string;
	sections?: MarquaTable[];
}>;

export interface FileOptions {
	entry: string;

	/**
	 * `minimal = false`
	 *
	 * it can be set to true so it will not generate anything
	 * other than what is written in the file's frontMatter
	 */
	minimal?: boolean;

	/**
	 * `exclude = []`
	 * accepts: 'toc' | 'rt' | 'date' | 'cnt'
	 *
	 * sometimes table of contents isn't needed and will add
	 * a lot of unnecessary bytes while it's still useful to
	 * know the read time duration
	 *
	 * these generated features can be individually turned off
	 * by passing their 'id's in an array
	 */
	exclude?: string[];
}

export interface DirOptions<Output extends object = {}> extends FileOptions {
	entry: string;

	/**
	 * `recurse = false`
	 *
	 * traverse will only scan the root/top-level directory
	 * and will recursively scan all nested subdirectories
	 * when this flag is turned on
	 */
	recurse?: boolean;

	/**
	 * `extensions = ['.md']`
	 *
	 * traverse will only scan directories with files that
	 * ends with '.md', this can be changed or added by
	 * passing in other extensions
	 *
	 * it will consequently overwrite the default array and
	 * remove '.md' extension, you will need to explicitly
	 * readd the extension again to your newly passed array
	 */
	extensions?: string[];

	sort?(
		x: keyof Output extends never ? Record<string, any> : Output,
		y: keyof Output extends never ? Record<string, any> : Output
	): number;
}

export interface FrontMatter {
	toc: MarquaTable[];
	read_time: number;
	content?: string | MarquaData[];
	date: Record<'created' | 'modified', Date> &
		Partial<Record<'published' | 'updated', string | Date>>;
}

export interface Hydrate<Options extends FileOptions, Input, Output = Input> {
	(chunk: {
		frontMatter: keyof Input extends never
			? Options['minimal'] extends true
				? Pick<FrontMatter, 'date'> & Record<string, any>
				: Omit<FrontMatter, 'content'> & Record<string, any>
			: Options['minimal'] extends true
			? Pick<FrontMatter, 'date'> & Input
			: Omit<FrontMatter, 'content' | keyof Input> & Input;
		content: string;
		breadcrumb: Array<string>;
	}): undefined | Output;
}

declare const UniqueInput: unique symbol;
declare const UniqueOutput: unique symbol;
export interface ParserTypes<Input, Output> {
	[UniqueInput]: Input;
	[UniqueOutput]: Output;
}
