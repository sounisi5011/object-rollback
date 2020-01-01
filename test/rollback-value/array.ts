import test from 'ava';
import cloneDeep from 'lodash.clonedeep';

import { ObjectState } from '../../src';
import { sortList } from '../helpers/utils';

test('should rollback array items', async t => {
    const value = [1, 2, 3];
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    value[1] **= 6;
    value.push(Infinity);
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});

test('should rollback array object properties', t => {
    const value = [true, false, null, NaN];
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    Object.assign(value, {
        x: 1,
        y: 2,
        z: 3,
    });
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});

test('should rollback array items order', async t => {
    const value = [1, 2, 3, 4, 5];
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    value.length = 0;
    value.push(2, 4, 1, 5, 3);
    t.deepEqual(sortList(value), sortList(origValueStruct));
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});

test('should rollback empty array', async t => {
    const value = Array(4);
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    value[1] = null;
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});

test('should rollback nested array items', t => {
    const item = ['a', 'b', 'c', 'd'];
    const value = [0, item, 1, 2];
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    item[1] = item[1].toUpperCase();
    item[9] = 'nine';
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});
