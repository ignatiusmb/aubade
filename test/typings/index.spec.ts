import { expectType } from 'tsd';
import { compile, traverse } from '../../src/internal';

/** Default: string input / no generics */
expectType<void | Record<string, any>>(compile(''));
expectType<Array<Record<string, any>>>(traverse(''));

/** Options: no minimal / no generics */
expectType<void | Record<string, any>>(compile({ entry: '' }));
expectType<Array<Record<string, any>>>(traverse({ entry: '' }));
