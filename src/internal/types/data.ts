import type { Typify } from 'mauss/typings';

export type MarquaData = Typify<{
	type: string;
	title: string;
	body: string | Array<MarquaData>;
}>;

export type MarquaTable = Typify<{
	id: string;
	title: string;
	sections?: Array<MarquaTable>;
}>;
