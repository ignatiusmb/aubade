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

expectType<undefined | Generic>(
	compile(
		entry,
		({ frontMatter }) => {
			expectType<Default>(frontMatter);
			expectType<string>(frontMatter.date);

			expectType<Array<ts.MarquaTable>>(frontMatter.toc);
			expectType<number>(frontMatter.read_time);
		},
		forge.types<Generic>()
	)
);

expectType<Array<Generic>>(
	traverse(
		entry,
		({ frontMatter }) => {
			expectType<Default>(frontMatter);
			expectType<string>(frontMatter.date);

			expectType<Array<ts.MarquaTable>>(frontMatter.toc);
			expectType<number>(frontMatter.read_time);
		},
		forge.types<Generic>()
	)
);
