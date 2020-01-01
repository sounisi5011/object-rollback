import test from 'ava';
import cloneDeep from 'lodash.clonedeep';

import { ObjectState } from '../../src';
import { sortList } from '../helpers/utils';

test('should rollback Map items', async t => {
    const value = new Map([
        [1, 'one'],
        [2, 'two'],
        [NaN, 'null'],
        [Infinity, '∞'],
    ]);
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState(value);

    value.set(
        42,
        'Answer to the Ultimate Question of Life, the Universe, and Everything',
    );
    value.delete(NaN);
    t.notDeepEqual(value, origValueStruct);

    state.rollback();
    t.deepEqual(value, origValueStruct);
});

test('should rollback Map object properties', t => {
    const value = new Map([
        [{}, 1],
        [{}, 2],
    ]);
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState(value);

    Object.assign(value, {
        '0': 0,
        '1': 1,
    });
    t.notDeepEqual(value, origValueStruct);

    state.rollback();
    t.deepEqual(value, origValueStruct);
});

test('should rollback Map items order', async t => {
    const value = new Map([1, 2, 3, 4, 5].map(val => [val, val ** 2]));
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState(value);

    value.delete(1);
    value.delete(2);
    value.delete(4);
    value.set(2, 2 ** 2);
    value.set(4, 4 ** 2);
    value.set(1, 1 ** 2);
    t.deepEqual(
        sortList(value.entries(), (a, b) => a[0] - b[0]),
        sortList(origValueStruct.entries(), (a, b) => a[0] - b[0]),
    );
    t.notDeepEqual(value, origValueStruct);

    state.rollback();
    t.deepEqual(value, origValueStruct);
});

test('should rollback nested Map items', t => {
    const key = new Map([
        [1, 2],
        [2, 3],
    ]);
    const item = new Map([
        [true, false],
        [false, null],
    ]);
    const value = new Map([
        [key, null],
        [null, item],
    ]);
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState(value);

    key.set(NaN, Infinity);
    item.set(false, true);
    value.set(new Map(), null);
    t.notDeepEqual(value, origValueStruct);

    state.rollback();
    t.deepEqual(value, origValueStruct);
});
