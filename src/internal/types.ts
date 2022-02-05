declare const UniqueInput: unique symbol;
declare const UniqueOutput: unique symbol;
export interface ParserTypes<Input, Output> {
	[UniqueInput]: Input;
	[UniqueOutput]: Output;
}

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
