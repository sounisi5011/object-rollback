import test from 'ava';
import cloneDeep from 'lodash.clonedeep';

import { ObjectState } from '../../src';

test('should rollback object properties', t => {
    const symF = Symbol('F');
    const value = {
        a: null,
        b: 42,
        c: true,
        d:
            'Answer to the Ultimate Question of Life, the Universe, and Everything',
        e: 0,
        [symF]: 'F',
    };
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    delete value.a;
    Object.assign(value, {
        c: false,
        da: 42,
        e: -0,
        [symF]: 'xxx',
        [Symbol('X')]: 'm9(^Д^)',
    });
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});

test('should rollback object getter / setter properties', t => {
    const value: Record<string, unknown> = {
        get random() {
            return Math.random();
        },
        set random(value) {
            Object.defineProperty(this, 'random', {
                value,
            });
        },
        get 'Answer to the Ultimate Question of Life, the Universe, and Everything'() {
            return 42;
        },
    };
    const origValuePropStruct = Object.getOwnPropertyDescriptors(value);

    const state = new ObjectState();
    state.set(value);

    value.random = null;
    delete value[
        'Answer to the Ultimate Question of Life, the Universe, and Everything'
    ];
    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        origValuePropStruct,
    );

    state.rollback(value);
    t.deepEqual(Object.getOwnPropertyDescriptors(value), origValuePropStruct);
});

test('should rollback object non-enumerable properties', t => {
    const value: Record<string, unknown> = Object.defineProperties(
        {},
        {
            x: {
                configurable: true,
                writable: true,
                value: 1,
            },
            y: {
                writable: true,
                value: 2,
            },
            minusZero: {
                configurable: true,
                writable: true,
                value: -0,
            },
            'Answer to the Ultimate Question of Life, the Universe, and Everything': {
                writable: true,
                value: 42,
            },
        },
    );
    const origValuePropStruct = Object.getOwnPropertyDescriptors(value);

    t.deepEqual(Object.keys(value), []);

    const state = new ObjectState();
    state.set(value);

    delete value.x;
    value.minusZero = 0;
    value[
        'Answer to the Ultimate Question of Life, the Universe, and Everything'
    ] = 54;
    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        origValuePropStruct,
    );

    state.rollback(value);
    t.deepEqual(Object.getOwnPropertyDescriptors(value), origValuePropStruct);
});

test('should not rollback object prototype properties', t => {
    const superObj = {
        x: 1,
        y: 2,
        z: 3,
        w: 4,
    };
    const value = Object.create(superObj);
    const origValueStruct = cloneDeep(value);
    const origValueProtoStruct = cloneDeep(Object.getPrototypeOf(value));

    const state = new ObjectState();
    state.set(value);

    value.y = 20;
    Object.getPrototypeOf(value).w = Infinity;
    t.notDeepEqual(value, origValueStruct);
    t.notDeepEqual(Object.getPrototypeOf(value), origValueProtoStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
    t.notDeepEqual(Object.getPrototypeOf(value), origValueProtoStruct);
});

test('should rollback nested object properties', t => {
    const value = {
        a: {
            x: 1,
            y: 2,
        },
        b: {
            x: 150,
            y: 100,
        },
    };
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    value.a.y = -1;
    Object.assign(value.b, {
        x: 200,
        å: true,
    });
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});

test('should rollback circular object properties', t => {
    const value = {
        a: 2,
        b: 7,
        c: {
            x: 1,
            y: 2,
            z: 3,
        },
        z: 42,
    };
    Object.assign(value.c, { circular: value });
    const origValueStruct = cloneDeep(value);

    const state = new ObjectState();
    state.set(value);

    value.b = 11;
    t.notDeepEqual(value, origValueStruct);

    state.rollback(value);
    t.deepEqual(value, origValueStruct);
});
