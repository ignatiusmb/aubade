export interface MarquaData {
	type: string;
	title: string;
	body: string | MarquaData[];
}

export interface MarquaTable {
	id: string;
	title: string;
	sections?: MarquaTable[];
}

export interface DirOptions<Output extends object = {}> {
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
		x: [keyof Output] extends [never] ? Record<string, any> : Output,
		y: [keyof Output] extends [never] ? Record<string, any> : Output
	): number;
}

export interface FrontMatter {
	content?: string;
	date: {
		published?: string | Date;
		updated?: string | Date;
	};

	//----> computed properties
	estimate: number;
	table: MarquaTable[];
}

export interface HydrateChunk<Input> {
	frontMatter: [keyof Input] extends [never]
		? Omit<FrontMatter, 'content'> & Record<string, any>
		: Omit<FrontMatter, 'content' | keyof Input> & Input;
	content: string;
	breadcrumb: string[];
}

export interface Hydrate<Input, Output = Input> {
	(chunk: HydrateChunk<Input>): undefined | Output;
}
