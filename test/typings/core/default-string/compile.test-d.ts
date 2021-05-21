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

expectType<undefined | Generic>(
	compile(entry, ({ frontMatter, content, breadcrumb }) => {
		expectType<Default>(frontMatter);
		expectType<Array<ts.MarquaTable>>(frontMatter.toc);
		expectType<number>(frontMatter.read_time);
		expectAssignable<object>(frontMatter.date);
		expectType<Date>(frontMatter.date.created);
		expectType<Date>(frontMatter.date.modified);

		expectType<Array<ts.MarquaData>>(content);

		expectType<Array<string>>(breadcrumb);
	})
);
