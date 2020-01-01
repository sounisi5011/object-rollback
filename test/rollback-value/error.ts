import test from 'ava';

import { ObjectState } from '../../src';

/**
 * @see https://www.ecma-international.org/ecma-262/10.0/#sec-native-error-types-used-in-this-standard
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects#Fundamental_objects
 */
const errorConstructorList = [
    Error,
    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError,
    URIError,
];

const errorPropNameList: (keyof Error | 'foo' | 'bar')[] = [
    'name',
    'message',
    'stack',
    'foo',
    'bar',
];

for (const ErrorConstructor of errorConstructorList) {
    for (const prop of errorPropNameList) {
        const testNameSuffix = `Assign "${prop}" property`;

        test(`should rollback ${ErrorConstructor.name} object properties / ${testNameSuffix}`, t => {
            const value = new ErrorConstructor('message');
            const origValuePropStruct = Object.getOwnPropertyDescriptors(value);

            const state = new ObjectState(value);

            Object.assign(value, { [prop]: 'str' });
            t.notDeepEqual(
                Object.getOwnPropertyDescriptors(value),
                origValuePropStruct,
            );

            state.rollback();
            t.deepEqual(
                Object.getOwnPropertyDescriptors(value),
                origValuePropStruct,
            );
        });
    }
}
