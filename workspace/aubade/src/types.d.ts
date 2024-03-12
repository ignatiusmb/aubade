import type { marker } from './artisan/index.js';
import type { parse } from './core/index.js';

type Primitives = string | boolean | null;

export interface FrontMatter {
	[key: string]: Primitives | Primitives[] | FrontMatter | FrontMatter[];
}

export interface FileChunk {
	type: 'file';
	path: string;
	breadcrumb: string[];
	buffer: Buffer;
}

export interface DirChunk {
	type: 'directory';
	path: string;
	breadcrumb: string[];
	buffer: undefined;
}

export interface HydrateChunk {
	breadcrumb: string[];
	buffer: Buffer;
	marker: typeof marker;
	parse: typeof parse;
	siblings: Array<FileChunk | DirChunk>;
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
