import { forge } from '../../../src';
import { expectType } from 'tsd';

expectType<{ entry: 'path/to/file/1'; minimal: true }>(
	forge.compile({ entry: 'path/to/file/1', minimal: true })
);
expectType<{ entry: 'path/to/file/2'; minimal: false }>(
	forge.compile({ entry: 'path/to/file/2', minimal: false })
);

expectType<{ entry: 'path/to/dir/1'; recurse: true }>(
	forge.traverse({ entry: 'path/to/dir/1', recurse: true })
);
expectType<{ entry: 'path/to/dir/2'; recurse: false }>(
	forge.traverse({ entry: 'path/to/dir/2', recurse: false })
);
