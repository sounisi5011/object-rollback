import test from 'ava';

import { ObjectState } from '../src';
import { inspectValue } from './helpers/utils';
import values from './helpers/values';
import objectValues from './helpers/values/object';
import primitiveValues from './helpers/values/primitive';

test('set() method should be possible to be called multiple times with the same primitive value', t => {
    const state = new ObjectState();
    for (const targetValue of primitiveValues) {
        t.notThrows(() => {
            state.set(targetValue);
            state.set(targetValue);
        }, `targetValue: ${inspectValue(targetValue)}`);
    }
});

test('set() method should not be possible to call multiple times with the same object value', t => {
    const state = new ObjectState();
    for (const targetValue of objectValues) {
        t.throws(
            () => {
                state.set(targetValue);
                state.set(targetValue);
            },
            {
                message: /(^|\W)The specified value has already been set(\W|$)/i,
            },
            'targetValue: ' +
                inspectValue(targetValue, { filstLineOnly: true }),
        );
    }
});

test('rollback() of primitive values not set yet should success', t => {
    const state = new ObjectState();
    for (const targetValue of primitiveValues) {
        t.notThrows(() => {
            state.rollback(targetValue);
        }, `targetValue: ${inspectValue(targetValue)}`);
    }
});

test('rollback() of object values not set yet should fail', t => {
    const state = new ObjectState();
    for (const targetValue of objectValues) {
        t.throws(
            () => {
                state.rollback(targetValue);
            },
            {
                instanceOf: RangeError,
                message: /(^|\W)The specified value has not been set yet(\W|$)/i,
            },
            'targetValue: ' +
                inspectValue(targetValue, { filstLineOnly: true }),
        );
    }
});

test('rollback() method should return the original value', t => {
    const state = new ObjectState();
    for (const targetValue of values) {
        state.set(targetValue);
        t.is(
            state.rollback(targetValue),
            targetValue,
            'targetValue: ' +
                inspectValue(targetValue, { filstLineOnly: true }),
        );
    }
});
