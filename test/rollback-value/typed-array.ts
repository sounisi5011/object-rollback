import test from 'ava';

import { ObjectState } from '../../src';

/**
 * @see https://tc39.es/ecma262/#table-the-typedarray-constructors
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#TypedArray_objects
 */
const typedArrayConstructorList = [
    Int8Array,
    Uint8Array,
    Uint8ClampedArray,
    Int16Array,
    Uint16Array,
    Int32Array,
    Uint32Array,
    ...(typeof BigInt64Array === 'function' ? [BigInt64Array] : []), // eslint-disable-line no-undef
    ...(typeof BigUint64Array === 'function' ? [BigUint64Array] : []), // eslint-disable-line no-undef
    Float32Array,
    Float64Array,
];

type TypedArray = InstanceType<typeof typedArrayConstructorList[number]>;

function setTypedArrayValue(
    typedArray: TypedArray,
    index: number,
    value: number,
): void {
    try {
        typedArray[index] = value;
    } catch (error) {
        if (
            error instanceof TypeError &&
            /^Cannot convert [0-9]+ to a BigInt$/.test(error.message)
        ) {
            typedArray[index] = BigInt(value); // eslint-disable-line no-undef
            return;
        }
        throw error;
    }
}

for (const TypedArrayConstructor of typedArrayConstructorList) {
    test(`should rollback ${TypedArrayConstructor.name} value`, async t => {
        const value = new TypedArrayConstructor(2);
        setTypedArrayValue(value, 0, 0xff);
        const origValueStruct = value.slice();

        const state = new ObjectState(value);

        setTypedArrayValue(value, 1, 0x07);
        t.notDeepEqual(value, origValueStruct);

        state.rollback();
        t.deepEqual(value, origValueStruct);
    });

    test(`should rollback ${TypedArrayConstructor.name} object properties`, t => {
        const value = new TypedArrayConstructor(2);
        setTypedArrayValue(value, 0, 0xff);
        const origValueStruct = value.slice();

        const state = new ObjectState(value);

        Object.assign(value, {
            x: 1,
            y: 2,
            z: 3,
        });
        t.notDeepEqual(value, origValueStruct);

        state.rollback();
        t.deepEqual(value, origValueStruct);
    });
}
