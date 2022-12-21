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

export interface TraverseOptions<Output extends object = {}> {
	entry: string;
	extensions?: string[];
	depth?: number;

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
	breadcrumb: string[];
	content: string;
	frontMatter: [keyof Input] extends [never]
		? Omit<FrontMatter, 'content'> & Record<string, any>
		: Omit<FrontMatter, 'content' | keyof Input> & Input;
}
