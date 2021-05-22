import { forge, compile, traverse } from '../../../src';
import { expectNotType, expectType } from 'tsd';

if ('compile:checking empty object') {
	const result = compile('', () => ({}), forge.types<{}>());
	expectNotType<any>(result);
	expectType<undefined | {}>(result);
}

if ('compile:checking at least one property') {
	const result = compile(
		{ entry: '' },
		({ frontMatter }) => ({ description: frontMatter.description }),
		forge.types<{ description: string }>()
	);
	expectNotType<any>(result);
	expectType<undefined | { description: string }>(result);
	expectType<undefined | { description: string }>(compile(''));
}

if ('compile:checking output types differ from input') {
	const result = compile(
		{ entry: '' },
		({ frontMatter }) => ({ description: [frontMatter.description] }),
		forge.types<{ description: string }, { description: Array<string> }>()
	);
	expectNotType<any>(result);
	expectNotType<Array<{ description: Array<any> }>>(result);
	expectType<undefined | { description: Array<string> }>(result);
}

if ('traverse:checking empty object') {
	const result = traverse('', () => ({}), forge.types<{}>());
	expectNotType<Array<any>>(result);
	expectType<Array<{}>>(result);
}

if ('traverse:checking at least one property') {
	const result = traverse(
		'',
		({ frontMatter }) => ({ description: frontMatter.description }),
		forge.types<{ description: string }>()
	);
	expectNotType<Array<any>>(result);
	expectType<Array<{ description: string }>>(result);
}

if ('traverse:checking output types differ from input') {
	const result = traverse(
		'',
		({ frontMatter }) => ({ description: [frontMatter.description] }),
		forge.types<{ description: string }, { description: Array<string> }>()
	);
	expectNotType<Array<any>>(result);
	expectNotType<Array<{ description: Array<any> }>>(result);
	expectType<Array<{ description: Array<string> }>>(result);
}
