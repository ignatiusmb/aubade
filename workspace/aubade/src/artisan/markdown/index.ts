import { Parser } from './parser.js';

export function markdown(/* options */) {
	return (input: string) => {
		// const tokens = tokenize(input);
		const system = new Parser(input);
		return {
			tokens: system.tokenize(),
			html() {
				return system.tokens.map((token) => token.render()).join('');
			},
		};
	};
}
