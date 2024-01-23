import type { marker } from './artisan/index.js';
import type { parse } from './core/index.js';

type Primitives = string | boolean | null;

export interface FrontMatter {
	[key: string]: Primitives | Primitives[] | FrontMatter | FrontMatter[];
}

export interface HydrateChunk {
	breadcrumb: string[];
	buffer: Buffer;
	marker: typeof marker;
	parse: typeof parse;
	siblings: Array<
		| { type: 'file'; breadcrumb: string[]; buffer: Buffer }
		| { type: 'directory'; breadcrumb: string[]; buffer: undefined }
	>;
}

export interface Metadata {
	estimate: number;
	table: AubadeTable[];
}

export interface AubadeData {
	type: string;
	title: string;
	body: string | AubadeData[];
}

export interface AubadeTable {
	id: string;
	level: number;
	title: string;
}