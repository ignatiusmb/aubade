import type { FrontMatter } from './types.js';

export function parse(raw: string, memo: Record<string, any> = {}): FrontMatter[string] {
	if (!/[:\-\[\]|#]/gm.test(raw)) return coerce(raw.trim());
	if (/^(".*"|'.*')$/.test(raw.trim())) return raw.trim().slice(1, -1);

	const PATTERN = /(^[^:\s]+):(?!\/)\r?\n?([\s\S]*?(?=^\S)|[\s\S]*$)/gm;
	let match: null | RegExpExecArray;
	while ((match = PATTERN.exec(raw))) {
		const [, key, value] = match;
		const data = parse(outdent(value), memo[key]);
		if (Array.isArray(data) || typeof data !== 'object') memo[key] = data;
		else memo[key] = { ...memo[key], ...data };
	}

	if (Object.keys(memo).length) return memo;

	const cleaned = raw.replace(/#.*$/gm, '').trim();
	switch (cleaned[0]) {
		case '-': {
			const sequence = cleaned.split(/^- /gm).filter((v) => v);
			const tabbed = sequence.map((v) =>
				v.replace(/\n( +)/g, (_, s) => '\n' + '\t'.repeat(s.length / 2)),
			);
			// @ts-expect-error - `FrontMatter` is assignable to itself
			return tabbed.map((v) => parse(outdent(` ${v}`)));
		}
		case '[': {
			const pruned = cleaned.slice(1, -1);
			return pruned.split(',').map(coerce);
		}
		case '|': {
			return outdent(cleaned.slice(1).replace('\n', ''));
		}
		default: {
			return coerce(cleaned.trim());
		}
	}
}

function coerce(u: string) {
	const v = u.trim(); // argument can be passed as-is
	const map = { true: true, false: false, null: null };
	if (v in map) return map[v as keyof typeof map];
	// if (!Number.isNaN(Number(v))) return Number(v);
	return /^(".*"|'.*')$/.test(v) ? v.slice(1, -1) : v;
}

function outdent(input: string) {
	const lines = input.split(/\r?\n/).filter((l) => l.trim());
	const { length } = (/^\s*/.exec(lines[0]) || [''])[0];
	return lines.map((l) => l.slice(length)).join('\n');
}
