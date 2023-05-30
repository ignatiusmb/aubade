export interface MarquaData {
	type: string;
	title: string;
	body: string | MarquaData[];
}

export interface MarquaTable {
	id: string;
	level: number;
	title: string;
	sections: MarquaTable[];
}
