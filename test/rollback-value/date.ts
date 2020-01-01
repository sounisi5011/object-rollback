import test from 'ava';
import cloneDeep from 'lodash.clonedeep';

import { ObjectState } from '../../src';
import { getAllPropertyNames } from '../helpers/utils';

test('should rollback Date object properties', t => {
    const value = new Date();
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

for (const setterMethodName of getAllPropertyNames(
    new Date(),
).filter(propName => /^set/.test(propName))) {
    test(`should rollback Date time / Update by ${setterMethodName}() method`, async t => {
        const value = new Date(0);
        const origValueStruct = cloneDeep(value);

        const state = new ObjectState();
        state.set(value);

        value[setterMethodName](2);
        t.notDeepEqual(value, origValueStruct);

        state.rollback(value);
        t.deepEqual(value, origValueStruct);
    });
}
