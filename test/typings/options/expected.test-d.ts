import { forge } from '../../../src';
import { expectType } from 'tsd';

expectType<{ entry: string; minimal: true }>(forge.compile({ entry: '', minimal: true }));
expectType<{ entry: ''; minimal: true }>(forge.compile({ entry: '', minimal: true }));
expectType<{ entry: ''; minimal: false }>(forge.compile({ entry: '', minimal: false }));

expectType<{ entry: string; recurse: true }>(forge.traverse({ entry: '', recurse: true }));
expectType<{ entry: ''; recurse: true }>(forge.traverse({ entry: '', recurse: true }));
expectType<{ entry: ''; recurse: false }>(forge.traverse({ entry: '', recurse: false }));
