import * as fs from 'fs';
import * as path from 'path';

/** @param {string} pathname  */
export function readJSON(pathname) {
	if (path.sep !== '/') pathname = pathname.replace(/\//g, path.sep);
	return JSON.parse(fs.readFileSync(pathname, 'utf-8'));
}
