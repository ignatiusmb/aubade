import type { Tokenizer } from './rules.js';
import type { BlockToken, Block, Token } from './types.js';
import { system } from './rules.js';

export class Parser {
	readonly source: string;

	index = 0;
	tree: Token[] = [];
	stack: Token[] = [];
	root: BlockToken<':document'>;

	constructor(source: string) {
		this.source = source.trim();
		this.root = { type: ':document', meta: { source: '!' }, children: [] };
		this.tree = this.root.children;
	}

	close() {
		while (this.stack.length) {
			const opened = this.stack[this.stack.length - 1];
			switch (opened.type) {
				// case 'parent:quote':
				case 'block:code':
					break;
				case 'inline:emphasis':
				case 'inline:strong':
				case 'inline:strike':
				case 'inline:code': {
					if (!opened.text) {
						opened.type = 'inline:text' as any;
						opened.text = opened.meta.source;
						// this.tree.push(this.stack.pop()!);
					}
					// break
				}
				default:
					this.stack.pop();
			}
		}
	}

	tokenize() {
		// 1. first-pass: block parsing
		for (const line of this.source.split('\n')) {
			const trimmed = line.trim();
			if (!trimmed) {
				// 1.1. clear the stack
				this.close();
				continue;
			}

			this.index = 0;
			const start = trimmed[0] as keyof typeof system;
			this.parse(trimmed, system[start] || system.fallback);
		}

		// 2. second-pass: inline parsing
		const queue = this.root.children.filter((t): t is Block => t.type.startsWith('parent:'));
		while (queue.length) {
			const block = queue.pop()!;
			if (!block.text) continue;
			this.tree = block.children;
			this.stack = [];
			this.index = 0;
			while (this.index < block.text.length) {
				this.parse(block.text, system.inline);
			}
			this.close();
		}

		return this.root;
	}

	parse(line: string, tokenizers: Tokenizer[]): Token {
		let index = this.index;
		let token: null | Token = null;
		for (const parse of tokenizers) {
			token = parse({
				source: line,
				tree: this.tree,
				stack: this.stack,

				eat(text) {
					if (text.length === 1) return line[index] === text && !!++index;
					if (text !== line.slice(index, index + text.length)) return false;
					index += text.length;
					return true;
				},
				read(length) {
					if (length === 1) return line[index++];
					const text = line.slice(index, index + length);
					index += text.length;
					return text;
				},
				locate(pattern) {
					const start = index;
					const match = pattern.exec(line.slice(index));
					if (match) {
						index = start + match.index;
						return line.slice(start, index);
					}
					return '';
				},
				peek(pattern) {
					const match = pattern.exec(line.slice(index));
					return match ? line.slice(index, index + match.index) : '';
				},
				trim() {
					while (index < line.length && /\s/.test(line[index])) {
						index++;
					}
				},
			});

			if (token) break;
			index = this.index;
		}

		if (!token) {
			throw new Error(`Unexpected character: ${line[index]}`);
		}

		this.index = index;
		return token;
	}
}
