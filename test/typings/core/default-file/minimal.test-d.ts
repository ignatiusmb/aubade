/**
 * input:
 * 	- entry: string
 * 	- minimal: true
 * generics: none
 */

import type * as ts from '../../../../src/internal/types';
import { forge, compile } from '../../../../src';
import { expectNotType, expectType } from 'tsd';

const options = forge.compile({
	entry: 'nonexistent-folder',
	minimal: true,
});

type Generic = Record<string, any>;
type Default = Pick<ts.FrontMatter, 'date'> & Generic;

expectType<undefined | Generic>(
	compile(options, ({ frontMatter, content, breadcrumb }) => {
		expectType<Default>(frontMatter);
		expectNotType<number>(frontMatter.read_time);

		expectType<string>(content);

		expectType<Array<string>>(breadcrumb);

		return undefined;
	})
);
