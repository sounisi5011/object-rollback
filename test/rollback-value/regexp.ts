import test from 'ava';
import cloneDeep from 'lodash.clonedeep';

import { ObjectState } from '../../src';

test('should rollback "lastIndex" property', t => {
    const str = '🍛🍡🍜';
    const value = /./gu;
    const copiedValue = new RegExp(value.source, value.flags.replace(/g/g, ''));

    const state = new ObjectState();
    state.set(value);

    t.is(value.lastIndex, 0);
    t.deepEqual(value.exec(str), copiedValue.exec(str));
    t.is(value.lastIndex, 2);
    t.notDeepEqual(value.exec(str), copiedValue.exec(str));
    t.is(value.lastIndex, 4);

    state.rollback(value);

    t.is(value.lastIndex, 0);
    t.deepEqual(value.exec(str), copiedValue.exec(str));
    t.is(value.lastIndex, 2);
});

test('should rollback RegExp object properties', t => {
    const value = /[Rr]eg[Ee]xp?/;
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    Object.assign(value, {
        hoge: 0,
        fuga: 1,
    });
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});
