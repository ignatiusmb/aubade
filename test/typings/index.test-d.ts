import type { FrontMatter, MarquaData } from '../../src/internal/types';
import { compile, traverse } from '../../src';
import { expectType } from 'tsd';
const entry = 'nonexistent-folder';

type DefaultFM = Omit<FrontMatter, 'content'> & Record<string, any>;
type MinimalFM = Pick<FrontMatter, 'date'> & Record<string, any>;

/** Default: string input / no generics */
expectType<void | Record<string, any>>(
	compile(entry, ({ frontMatter, content, breadcrumb }) => {
		expectType<DefaultFM>(frontMatter);
		expectType<Array<MarquaData>>(content);
		expectType<Array<string>>(breadcrumb);
	})
);
expectType<Array<Record<string, any>>>(
	traverse(entry, ({ frontMatter, content, breadcrumb }) => {
		expectType<DefaultFM>(frontMatter);
		expectType<Array<MarquaData>>(content);
		expectType<Array<string>>(breadcrumb);
	})
);

/** Options: no minimal / no generics */
expectType<void | Record<string, any>>(
	compile({ entry }, ({ frontMatter, content, breadcrumb }) => {
		expectType<DefaultFM>(frontMatter);
		expectType<Array<MarquaData>>(content);
		expectType<Array<string>>(breadcrumb);
	})
);

/** Options: minimal on / no generics */
expectType<void | Record<string, any>>(
	compile({ entry, minimal: true }, ({ frontMatter, content, breadcrumb }) => {
		expectType<MinimalFM>(frontMatter);
		expectType<string>(content);
		expectType<Array<string>>(breadcrumb);
	})
);

/** Options: recurse on / no generics */
expectType<Array<Record<string, any>>>(
	traverse({ entry, recurse: true }, ({ frontMatter, content, breadcrumb }) => {
		expectType<DefaultFM>(frontMatter);
		expectType<Array<MarquaData>>(content);
		expectType<Array<string>>(breadcrumb);
	})
);
