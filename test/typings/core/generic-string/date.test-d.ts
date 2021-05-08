/**
 * input: string
 * generics:
 * 	- date: string
 */

import type * as ts from '../../../../src/internal/types';
import { forge, compile, traverse } from '../../../../src';
import { expectType } from 'tsd';

const entry = 'nonexistent-folder';

type Generic = { date: string };
type Default = Omit<ts.FrontMatter, 'content' | keyof Generic> & Generic;

expectType<void | Generic>(
	compile(
		entry,
		({ frontMatter, content, breadcrumb }) => {
			expectType<Omit<ts.FrontMatter, 'content' | keyof Generic> & Generic>(frontMatter);
			expectType<Array<ts.MarquaTable>>(frontMatter.toc);
			expectType<number>(frontMatter.read_time);
			expectType<string>(frontMatter.date);

			expectType<Array<ts.MarquaData>>(content);
			expectType<Array<string>>(breadcrumb);
		},
		forge.types<Generic>()
	)
);

expectType<Array<Generic>>(
	traverse(
		entry,
		({ frontMatter, content, breadcrumb }) => {
			expectType<Default>(frontMatter);

			expectType<Array<ts.MarquaData>>(content);
			expectType<Array<string>>(breadcrumb);
		},
		forge.types<Generic>()
	)
);
