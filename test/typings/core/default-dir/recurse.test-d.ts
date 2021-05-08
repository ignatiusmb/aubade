/**
 * input:
 * 	- entry: string
 * 	- recurse: true
 * generics: none
 */

import type * as ts from '../../../../src/internal/types';
import { forge, traverse } from '../../../../src';
import { expectType } from 'tsd';

const options = forge.traverse({
	entry: 'nonexistent-folder',
	recurse: true,
});

type Generic = Record<string, any>;
type Default = Omit<ts.FrontMatter, 'content'> & Generic;

expectType<Array<Generic>>(
	traverse(options, ({ frontMatter, content, breadcrumb }) => {
		expectType<Default>(frontMatter);

		expectType<Array<ts.MarquaData>>(content);

		expectType<Array<string>>(breadcrumb);
	})
);
