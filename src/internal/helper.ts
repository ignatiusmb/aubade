import { isExists } from 'mauss/guards';

const dateFormat = /\d{1,4}-\d{1,2}-\d{1,4}/;

export const clean = (arr: string[]) => arr.filter(isExists);
export const compareDate = (x: string, y: string) => new Date(y).getTime() - new Date(x).getTime();
export const compareString = (x: string, y: string) =>
	dateFormat.test(x) && dateFormat.test(y) ? compareDate(x, y) : x.localeCompare(y);
