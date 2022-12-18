/**
 * input: string
 * generics: none
 */

import type * as ts from '../../../../src/internal/types';
import { compile } from '../../../../src';
import { expectAssignable, expectType } from 'tsd';

const entry = 'nonexistent-folder';

type Generic = Record<string, any>;
type Default = Omit<ts.FrontMatter, 'content'> & Generic;

const data = compile(entry, ({ frontMatter, content, breadcrumb }) => {
	expectType<Default>(frontMatter);
	expectType<Array<ts.MarquaTable>>(frontMatter.toc);
	expectType<number>(frontMatter.read_time);
	expectAssignable<object>(frontMatter.date);

	expectType</*Array< ts.MarquaData >*/ string>(content);

	expectType<Array<string>>(breadcrumb);

	return undefined;
});

expectType<undefined | Generic>(data);
expectType<undefined | Generic>(compile(''));