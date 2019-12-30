import test from 'ava';

import { ObjectState } from '../../src';

test('should rollback DataView value / Int8', async t => {
    const value = new DataView(new ArrayBuffer(1));
    value.setInt8(0, 1);

    const state = new ObjectState();
    state.set(value);

    value.setInt8(0, 2);
    t.not(value.getInt8(0), 1);

    state.rollback(value);
    t.is(value.getInt8(0), 1);
});

test('should rollback DataView value / Uint8', async t => {
    const value = new DataView(new ArrayBuffer(1));
    value.setUint8(0, 1);

    const state = new ObjectState();
    state.set(value);

    value.setUint8(0, 2);
    t.not(value.getUint8(0), 1);

    state.rollback(value);
    t.is(value.getUint8(0), 1);
});

test('should rollback DataView value / Int16', async t => {
    const value = new DataView(new ArrayBuffer(2));
    value.setInt16(0, 1);

    const state = new ObjectState();
    state.set(value);

    value.setInt16(0, 2);
    t.not(value.getInt16(0), 1);

    state.rollback(value);
    t.is(value.getInt16(0), 1);
});

test('should rollback DataView value / Uint16', async t => {
    const value = new DataView(new ArrayBuffer(2));
    value.setUint16(0, 1);

    const state = new ObjectState();
    state.set(value);

    value.setUint16(0, 2);
    t.not(value.getUint16(0), 1);

    state.rollback(value);
    t.is(value.getUint16(0), 1);
});

test('should rollback DataView value / Int32', async t => {
    const value = new DataView(new ArrayBuffer(4));
    value.setInt32(0, 1);

    const state = new ObjectState();
    state.set(value);

    value.setInt32(0, 2);
    t.not(value.getInt32(0), 1);

    state.rollback(value);
    t.is(value.getInt32(0), 1);
});

test('should rollback DataView value / Uint32', async t => {
    const value = new DataView(new ArrayBuffer(4));
    value.setUint32(0, 1);

    const state = new ObjectState();
    state.set(value);

    value.setUint32(0, 2);
    t.not(value.getUint32(0), 1);

    state.rollback(value);
    t.is(value.getUint32(0), 1);
});

test('should rollback DataView value / Float32', async t => {
    const value = new DataView(new ArrayBuffer(4));
    value.setFloat32(0, 1);

    const state = new ObjectState();
    state.set(value);

    value.setFloat32(0, 2);
    t.not(value.getFloat32(0), 1);

    state.rollback(value);
    t.is(value.getFloat32(0), 1);
});

test('should rollback DataView value / Float64', async t => {
    const value = new DataView(new ArrayBuffer(8));
    value.setFloat64(0, 1);

    const state = new ObjectState();
    state.set(value);

    value.setFloat64(0, 2);
    t.not(value.getFloat64(0), 1);

    state.rollback(value);
    t.is(value.getFloat64(0), 1);
});

if (
    typeof DataView.prototype.getBigInt64 === 'function' &&
    typeof DataView.prototype.setBigInt64 === 'function'
) {
    test('should rollback DataView value / BigInt64', async t => {
        const value = new DataView(new ArrayBuffer(8));
        value.setBigInt64(0, BigInt(1)); // eslint-disable-line no-undef

        const state = new ObjectState();
        state.set(value);

        value.setBigInt64(0, BigInt(2)); // eslint-disable-line no-undef
        t.not(value.getBigInt64(0), BigInt(1)); // eslint-disable-line no-undef

        state.rollback(value);
        t.is(value.getBigInt64(0), BigInt(1)); // eslint-disable-line no-undef
    });
}

if (
    typeof DataView.prototype.getBigUint64 === 'function' &&
    typeof DataView.prototype.setBigUint64 === 'function'
) {
    test('should rollback DataView value / BigUint64', async t => {
        const value = new DataView(new ArrayBuffer(8));
        value.setBigUint64(0, BigInt(1)); // eslint-disable-line no-undef

        const state = new ObjectState();
        state.set(value);

        value.setBigUint64(0, BigInt(2)); // eslint-disable-line no-undef
        t.not(value.getBigUint64(0), BigInt(1)); // eslint-disable-line no-undef

        state.rollback(value);
        t.is(value.getBigUint64(0), BigInt(1)); // eslint-disable-line no-undef
    });
}

test('should rollback DataView object properties', t => {
    const value = new DataView(new ArrayBuffer(4));
    const origValuePropStruct = Object.getOwnPropertyDescriptors(value);

    const state = new ObjectState();
    state.set(value);

    Object.assign(value, {
        x: 1,
        y: 2,
        z: 3,
    });
    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        origValuePropStruct,
    );

    state.rollback(value);
    t.deepEqual(Object.getOwnPropertyDescriptors(value), origValuePropStruct);
});
