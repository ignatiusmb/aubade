import { parse, stringify } from './index.js';

declare function expect<T>(v: T): void;

(/* parse */) => {
	// const castable: Record<string, any> = parse('');
	const castable = parse('') as Record<string, any>;
	expect<object>(castable);
};

(/* stringify */) => {
	expect<string>(stringify({}));

	// @ts-expect-error - fix leaky implementation
	stringify(parse(''));
	stringify({ hello: 'world', foo: ['bar', 'baz'], nested: { key: 'value' } });
	stringify({} as Record<string, any>);
	stringify({} as Record<string, unknown>);
	stringify({
		draft: undefined,
		estimate: 5,
		null: null,
		empty: '',
		array: [],
		boolean: true,
		table: [
			{ id: 'section1', title: 'Section 1', level: 2 },
			{ id: 'section2', title: 'Section 2', level: 3 },
		],
	});
};
