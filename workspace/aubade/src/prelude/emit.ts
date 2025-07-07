import { FrontMatter, Primitives } from './types.js';

export function emit(data: FrontMatter, indent = 0): string {
	const TAB = '  '.repeat(indent);
	const items = Object.entries(data).map(([key, value]) => {
		if (Array.isArray(value)) {
			if (value.every((v) => typeof v === 'string' || typeof v === 'boolean' || v === null)) {
				return `${TAB}${key}: [${value.map(format).join(', ')}]`;
			}

			const list = value.map((v) => {
				if (typeof v === 'string' || typeof v === 'boolean' || v === null) {
					return `${TAB}- ${format(v)}`;
				}
				return modify(
					emit(v, indent + 1),
					(line, i) => `${'  '.repeat(indent + 1)}${i === 0 ? '- ' : '  '}${line.trimStart()}`,
				);
			});
			return `${TAB}${key}:\n${list.join('\n')}`;
		}

		if (typeof value === 'object' && value != null) {
			return `${TAB}${key}:\n${emit(value, indent + 1)}`;
		}

		if (typeof value === 'string' && value.includes('\n')) {
			return `${TAB}${key}: |\n${modify(value, (line) => TAB + '  ' + line)}`;
		}

		return `${TAB}${key}: ${format(value)}`;
	});

	return items.join('\n');
}

function format(value: Primitives): string {
	if (value === null) return 'null';
	if (typeof value === 'boolean') return value ? 'true' : 'false';

	if (/[:{}\[\],&*#?|<>=!%@\\]/.test(value) || /^\s|\s$/.test(value)) {
		return `"${value.replace(/"/g, '\\"')}"`;
	}

	return value;
}

function modify(source: string, fn: (line: string, index: number) => string): string {
	return source
		.split('\n')
		.map((line, index) => fn(line, index))
		.join('\n');
}
