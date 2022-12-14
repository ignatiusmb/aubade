import fs from 'fs';
import path from 'path';

export function readJSON(pathname) {
	if (path.sep !== '/') pathname = pathname.replace(/\//g, path.sep);
	return JSON.parse(fs.readFileSync(pathname, 'utf-8'));
}
