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

    const state = new ObjectState(value);

    delete value.a;
    Object.assign(value, {
        c: false,
        da: 42,
        e: -0,
        [symF]: 'xxx',
        [Symbol('X')]: 'm9(^Д^)',
    });
    t.notDeepEqual(value, origValueStruct);

    state.rollback();
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

    const state = new ObjectState(value);

    value.random = null;
    delete value[
        'Answer to the Ultimate Question of Life, the Universe, and Everything'
    ];
    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        origValuePropStruct,
    );

    state.rollback();
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

    const state = new ObjectState(value);

    delete value.x;
    value.minusZero = 0;
    value[
        'Answer to the Ultimate Question of Life, the Universe, and Everything'
    ] = 54;
    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        origValuePropStruct,
    );

    state.rollback();
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

    const state = new ObjectState(value);

    value.y = 20;
    Object.getPrototypeOf(value).w = Infinity;
    t.notDeepEqual(value, origValueStruct);
    t.notDeepEqual(Object.getPrototypeOf(value), origValueProtoStruct);

    state.rollback();
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

    const state = new ObjectState(value);

    value.a.y = -1;
    Object.assign(value.b, {
        x: 200,
        å: true,
    });
    t.notDeepEqual(value, origValueStruct);

    state.rollback();
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

    const state = new ObjectState(value);

    value.b = 11;
    t.notDeepEqual(value, origValueStruct);

    state.rollback();
    t.deepEqual(value, origValueStruct);
});

test('should rollback non-writable object properties', t => {
    const value = {
        a: 2,
        b: 7,
        c: 9,
        d: 16,
        e: 98,
    };
    const origValueStruct = cloneDeep(value);
    const origValuePropStruct = Object.getOwnPropertyDescriptors(value);

    const state = new ObjectState(value);

    Object.defineProperties(value, {
        a: { value: 1 },
        b: {
            writable: false,
            value: 2,
        },
        c: { value: 3 },
        d: {
            writable: false,
            value: 4,
        },
        e: { value: 5 },
    });
    t.notDeepEqual(value, origValueStruct);

    t.notThrows(() => state.rollback());

    t.deepEqual(value, origValueStruct);
    t.deepEqual(Object.getOwnPropertyDescriptors(value), origValuePropStruct);
});

test('should rollback non-configurable object properties value', t => {
    const value = {
        a: 2,
        b: 7,
        c: 9,
        d: 16,
        e: 98,
    };
    const origValueStruct = cloneDeep(value);
    const origValuePropStruct = Object.getOwnPropertyDescriptors(value);

    const state = new ObjectState(value);

    Object.defineProperties(value, {
        a: { value: 1 },
        b: {
            configurable: false,
            value: 2,
        },
        c: { value: 3 },
        d: {
            configurable: false,
            value: 4,
        },
        e: { value: 5 },
    });
    t.notDeepEqual(value, origValueStruct);

    t.notThrows(() => state.rollback());

    t.deepEqual(value, origValueStruct);

    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        origValuePropStruct,
    );
    t.deepEqual(
        Object.getOwnPropertyDescriptor(value, 'a'),
        origValuePropStruct.a,
    );
    t.notDeepEqual(
        Object.getOwnPropertyDescriptor(value, 'b'),
        origValuePropStruct.b,
    );
    t.deepEqual(
        Object.getOwnPropertyDescriptor(value, 'c'),
        origValuePropStruct.c,
    );
    t.notDeepEqual(
        Object.getOwnPropertyDescriptor(value, 'd'),
        origValuePropStruct.d,
    );
    t.deepEqual(
        Object.getOwnPropertyDescriptor(value, 'e'),
        origValuePropStruct.e,
    );
});

test('should skip non-configurable and non-writable object properties', t => {
    const value = {
        a: 2,
        b: 7,
        c: 9,
        d: 16,
        e: 98,
    };
    const origValueStruct = cloneDeep(value);
    const origValuePropStruct = Object.getOwnPropertyDescriptors(value);

    const state = new ObjectState(value);

    Object.defineProperties(value, {
        a: { value: 1 },
        b: {
            configurable: false,
            writable: false,
            value: 2,
        },
        c: { value: 3 },
        d: {
            configurable: false,
            writable: false,
            value: 4,
        },
        e: { value: 5 },
    });
    t.notDeepEqual(value, origValueStruct);

    t.notThrows(() => state.rollback());

    t.notDeepEqual(value, origValueStruct);
    t.is(value.a, origValueStruct.a);
    t.not(value.b, origValueStruct.b);
    t.is(value.c, origValueStruct.c);
    t.not(value.d, origValueStruct.d);
    t.is(value.e, origValueStruct.e);

    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        origValuePropStruct,
    );
    t.deepEqual(
        Object.getOwnPropertyDescriptor(value, 'a'),
        origValuePropStruct.a,
    );
    t.notDeepEqual(
        Object.getOwnPropertyDescriptor(value, 'b'),
        origValuePropStruct.b,
    );
    t.deepEqual(
        Object.getOwnPropertyDescriptor(value, 'c'),
        origValuePropStruct.c,
    );
    t.notDeepEqual(
        Object.getOwnPropertyDescriptor(value, 'd'),
        origValuePropStruct.d,
    );
    t.deepEqual(
        Object.getOwnPropertyDescriptor(value, 'e'),
        origValuePropStruct.e,
    );
});
