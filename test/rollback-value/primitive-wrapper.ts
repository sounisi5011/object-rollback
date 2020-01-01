import test from 'ava';

import { ObjectState } from '../../src';

/**
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Primitive#Primitive_wrapper_objects_in_JavaScript
 */
const primitiveWrapperObjectsConstructorList = [
    Object,
    Function,
    String,
    Number,
    Boolean,
];

for (const PrimitiveWrapperConstructor of primitiveWrapperObjectsConstructorList) {
    test(`should rollback ${PrimitiveWrapperConstructor.name} object properties`, t => {
        const value = new PrimitiveWrapperConstructor();
        const origValuePropStruct = Object.getOwnPropertyDescriptors(value);

        const state = new ObjectState();
        state.set(value);

        Object.assign(value, {
            hoge: 0,
            fuga: 1,
        });
        t.notDeepEqual(
            Object.getOwnPropertyDescriptors(value),
            origValuePropStruct,
        );

        state.rollback(value);
        t.deepEqual(
            Object.getOwnPropertyDescriptors(value),
            origValuePropStruct,
        );
    });
}
