/**
 * input:
 * 	- entry: string
 * generics: none
 */

import type * as ts from '../../../../src/internal/types';
import { forge, compile } from '../../../../src';
import { expectType } from 'tsd';

const options = forge.compile({
	entry: 'nonexistent-folder',
});

type Generic = Record<string, any>;
type Default = Omit<ts.FrontMatter, 'content'> & Generic;

expectType<void | Generic>(
	compile(options, ({ frontMatter, content, breadcrumb }) => {
		expectType<Default>(frontMatter);

		expectType<Array<ts.MarquaData>>(content);

		expectType<Array<string>>(breadcrumb);
	})
);
