import fs from 'fs';
import path from 'path';

export function readJSON(pathname: string) {
	const inverse = new RegExp(path.sep === '/' ? '\\' : '/', 'g');
	const normalized = pathname.replace(inverse, path.sep);
	return JSON.parse(fs.readFileSync(normalized, 'utf-8'));
}
