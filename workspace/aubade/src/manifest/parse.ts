type Primitives = string | boolean | null;

export interface FrontMatter {
	[key: string]: Primitives | Primitives[] | FrontMatter | FrontMatter[];
}

export function parse(raw: string, memo: Record<string, any> = {}): FrontMatter[string] {
	raw = raw.trim();

	if ((raw[0] === '"' || raw[0] === "'") && raw.endsWith(raw[0])) {
		return raw.slice(1, -1);
	}

	if (raw.startsWith('|')) {
		return outdent(raw.slice(1));
	}

	if (raw.startsWith('- ')) {
		const sequence = raw.split(/^- /gm).filter((v) => v);
		const tabbed = sequence.map((v) =>
			v.replace(/\n( +)/g, (_, s) => '\n' + '\t'.repeat(s.length / 2)),
		);
		return tabbed.map((v) => parse(outdent(` ${v}`))) as FrontMatter[];
	}

	if (raw.startsWith('[') && raw.endsWith(']')) {
		const result: Primitives[] = [];
		let current = '';
		let quoted: '"' | "'" | null = null;
		let escaped = false;
		for (const char of raw.slice(1, -1)) {
			quoted = char === quoted ? null : char === '"' || char === "'" ? char : quoted;
			escaped = !escaped && char === '\\';
			if (!quoted && char === ',') result.push(coerce(current));
			current = quoted || escaped || char !== ',' ? current + char : '';
		}
		if (current) result.push(coerce(current));
		return result;
	}

	const PATTERN = /(^[^:\s]+):(?!\/)\r?\n?([\s\S]*?(?=^\S)|[\s\S]*$)/gm;
	let match: null | RegExpExecArray;
	while ((match = PATTERN.exec(raw))) {
		const [, key, value] = match;
		const data = parse(outdent(value), memo[key]);
		const pass = typeof data !== 'object' || Array.isArray(data);
		memo[key] = data == null || pass ? data : { ...memo[key], ...data };
	}

	if (Object.keys(memo).length) return memo;
	return coerce(raw.replace(/#.*$/gm, '').trim());
}

function coerce(u: string): Primitives {
	const v = u.trim(); // argument can be passed as-is
	const map = { true: true, false: false, null: null };
	if (v in map) return map[v as keyof typeof map];
	// if (!Number.isNaN(Number(v))) return Number(v);
	return /^(".*"|'.*')$/.test(v) ? v.slice(1, -1) : v;
}

function outdent(input: string): string {
	const lines = input.split(/\r?\n/).filter((l) => l.trim());
	const { length } = (/^\s*/.exec(lines[0]) || [''])[0];
	return lines.map((l) => l.slice(length)).join('\n');
}
