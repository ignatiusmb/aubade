import type { Token } from './types.js';
import { close, system } from './rules.js';

export class Parser {
	readonly source: string;

	index = 0;

	tokens: Token[] = [];

	constructor(source: string) {
		this.source = source.trim();
	}

	tokenize() {
		// const system = Object.values(rules);
		const tokens = this.tokens.slice();
		const opened = this.tokens.slice();

		let escaped = false;
		while (this.index < this.source.length) {
			const source = this.source;
			let index = this.index;
			let token: null | Token = null;

			// const char = source[index] as keyof typeof dispatch;
			// const system = dispatch[char] || dispatch.fallback;
			escaped = !escaped && source[index] === '\\' && !!++this.index;
			// const system = escaped ? dispatch.escaped : rule;

			for (const tokenize of escaped ? system['\\'] : system.fallback) {
				token = tokenize({
					tree: tokens,
					stack: opened,

					eat(text) {
						if (text.length === 1) return source[index] === text && !!++index;
						if (text !== source.slice(index, index + text.length)) return false;
						index += text.length;
						return true;
					},
					read(length) {
						if (length === 1) return source[index++];
						const text = source.slice(index, index + length);
						index += text.length;
						return text;
					},
					locate(pattern) {
						const start = index;
						const match = pattern.exec(source.slice(index));
						if (match) {
							index = start + match.index;
							return source.slice(start, index);
						}
						return '';
					},
					peek(pattern) {
						const match = pattern.exec(source.slice(index));
						return match ? source.slice(index, index + match.index) : '';
					},
					trim() {
						while (index < source.length && /\s/.test(source[index])) {
							index++;
						}
					},
				});

				if (token) break;
				index = this.index;
			}

			if (token == null) {
				throw new Error(`Unexpected character: ${source[index]}`);
			}

			const same = token === tokens[tokens.length - 1];
			!same && tokens.push(token);
			this.index = index;
		}

		close(opened, tokens);
		this.tokens = tokens;
		return tokens;
	}
}
