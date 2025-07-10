export function stringify(data: object, indent = 0): string {
	const TAB = '  '.repeat(indent);
	const items = Object.entries(data).map(([key, value]) => {
		if (value === undefined) return undefined;

		if (Array.isArray(value)) {
			if (value.every((v) => typeof v === 'string' || typeof v === 'boolean' || v === null)) {
				return `${TAB}${key}: [${value.map(format).join(', ')}]`;
			}

			const list = value.map((v) => {
				if (typeof v === 'string' || typeof v === 'boolean' || v === null) {
					return `${TAB}- ${format(v)}`;
				}
				return modify(
					stringify(v, indent + 1),
					(line, i) => `${'  '.repeat(indent + 1)}${i === 0 ? '- ' : '  '}${line.trimStart()}`,
				);
			});
			return `${TAB}${key}:\n${list.join('\n')}`;
		}

		if (typeof value === 'object' && value != null) {
			return `${TAB}${key}:\n${stringify(value, indent + 1)}`;
		}

		if (typeof value === 'string' && value.includes('\n')) {
			return `${TAB}${key}: |\n${modify(value, (line) => TAB + '  ' + line)}`;
		}

		return `${TAB}${key}: ${format(value)}`;
	});

	return items.filter(Boolean).join('\n');
}

function format(input: unknown): string {
	const value = String(input).trim();
	if (/[:{}\[\],&*#?|<>=!%@\\"]/.test(value) && !value.includes(':/')) {
		return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
	}
	return value;
}

function modify(source: string, fn: (line: string, index: number) => string): string {
	return source
		.split('\n')
		.map((line, index) => fn(line, index))
		.join('\n');
}
