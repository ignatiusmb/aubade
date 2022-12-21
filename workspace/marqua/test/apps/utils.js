import * as fs from 'fs';
import * as path from 'path';

export function readJSON(pathname) {
	if (path.sep !== '/') pathname = pathname.replace(/\//g, path.sep);
	return JSON.parse(fs.readFileSync(pathname, 'utf-8'));
}
