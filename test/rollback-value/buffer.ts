import test from 'ava';

import { ObjectState } from '../../src';

test('should rollback Buffer value', async t => {
    const value = Buffer.from('abcdefgh');
    const origValueStruct = Buffer.from(value);

    const state = new ObjectState(value);

    value[1] = 0xff;
    value.fill(0x00, 4);
    t.notDeepEqual(value, origValueStruct);

    state.rollback();
    t.deepEqual(value, origValueStruct);
});

test('should rollback Buffer object properties', t => {
    const value = Buffer.from('foo');
    const origValueStruct = Buffer.from(value);

    const state = new ObjectState(value);

    Object.assign(value, {
        x: 1,
        y: 2,
        z: 3,
        '9': 0x99,
    });
    t.notDeepEqual(value, origValueStruct);

    state.rollback();
    t.deepEqual(value, origValueStruct);
});
