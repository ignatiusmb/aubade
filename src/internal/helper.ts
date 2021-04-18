import { isExists } from 'mauss/guards';

const separators = /[\s\][!"#$%&'()*+,./:;<=>?@\\^_{|}~-]/g;

export const clean = (arr: string[]) => arr.filter(isExists);
export const generate = {
	id(title: string) {
		title = title.toLowerCase().replace(separators, '-');
		return title.replace(/-+/g, '-').replace(/^-*(.+)-*$/, '$1');
	},
};
