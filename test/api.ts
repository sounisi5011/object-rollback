import test from 'ava';

import { ObjectState } from '../src';
import { inspectValue } from './helpers/utils';
import values from './helpers/values';
import objectValues from './helpers/values/object';
import primitiveValues from './helpers/values/primitive';

for (const targetValue of primitiveValues) {
    const testNameSuffix = inspectValue({ targetValue });
    test(`Constructor should accept primitive value argument / ${testNameSuffix}`, t => {
        t.notThrows(() => new ObjectState(targetValue));
    });
}

for (const targetValue of objectValues) {
    const testNameSuffix = inspectValue({ targetValue });
    test(`Constructor should accept object value argument / ${testNameSuffix}`, t => {
        t.notThrows(() => new ObjectState(targetValue));
    });
}

test('Constructor should not accept less than 1 argument', t => {
    t.throws(
        () =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore TS2554: Expected 1 arguments, but got 0.
            new ObjectState(),
        {
            instanceOf: TypeError,
            message: `Constructor ${ObjectState.name} requires 1 argument`,
        },
    );
});

test('Constructor should not accept more than one argument', t => {
    t.throws(
        () =>
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore TS2554: Expected 1 arguments, but got 2.
            new ObjectState({}, {}),
        {
            instanceOf: TypeError,
            message: `Constructor ${ObjectState.name} requires only 1 argument`,
        },
    );
});

for (const targetValue of values) {
    const testNameSuffix = inspectValue({ targetValue });

    test(`rollback() method should return the original value / ${testNameSuffix}`, t => {
        t.notThrows(() => {
            const state = new ObjectState(targetValue);
            t.is(state.rollback(), targetValue);
        });
    });

    test(`rollback() method should be possible to be called multiple times / ${testNameSuffix}`, t => {
        t.notThrows(() => {
            const state = new ObjectState(targetValue);
            for (let i = 1; i <= 5; i++) {
                t.notThrows(() => state.rollback(), inspectValue({ i }));
            }
        });
    });
}
