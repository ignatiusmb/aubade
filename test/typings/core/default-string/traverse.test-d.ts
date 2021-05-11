/**
 * input: string
 * generics: none
 */

import type * as ts from '../../../../src/internal/types';
import { traverse } from '../../../../src';
import { expectType } from 'tsd';

const entry = 'nonexistent-folder';

type Generic = Record<string, any>;
type Default = Omit<ts.FrontMatter, 'content'> & Generic;

expectType<Array<Generic>>(
	traverse(entry, ({ frontMatter, content, breadcrumb }) => {
		expectType<Default>(frontMatter);

		expectType<Array<ts.MarquaData>>(content);

		expectType<Array<string>>(breadcrumb);
	})
);
