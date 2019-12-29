import test from 'ava';
import cloneDeep from 'lodash.clonedeep';

import { ObjectState } from '../../src';
import { sortList } from '../helpers/utils';

test('should rollback Set items', async t => {
    const value = new Set([1, null, 'A', true, -3]);
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    value.add(42);
    value.delete(null);
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});

test('should rollback Set items order', async t => {
    const value = new Set([1, 2, 3, 4, 5]);
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    value.delete(1);
    value.delete(2);
    value.delete(4);
    value.add(2);
    value.add(4);
    value.add(1);
    t.deepEqual(sortList(value.values()), sortList(origValueStruct.values()));
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});
