import test from 'ava';
import cloneDeep from 'lodash.clonedeep';

import { ObjectState } from '../../src';
import { inspectValue } from '../helpers/utils';

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

    Object.assign(value, {
        newProp01: 11,
        newProp02: 12,
        newProp03: 13,
        newProp04: 14,
        newProp05: 15,
    });
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
        newProp02: { writable: false },
        newProp04: { writable: false },
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
        get d() {
            return 16;
        },
        get e() {
            return 98;
        },
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
            writable: true,
            value: 4,
        },
        e: { writable: true, value: 5 },
    });
    const updatedValuePropStruct = Object.getOwnPropertyDescriptors(value);

    t.notDeepEqual(value, origValueStruct);
    t.notDeepEqual(updatedValuePropStruct, origValuePropStruct);

    t.notThrows(() => state.rollback());

    t.notDeepEqual(value, origValueStruct);
    for (const propName of ['a', 'b', 'c', 'e'] as (keyof typeof value)[]) {
        t.is(
            value[propName],
            origValueStruct[propName],
            inspectValue({ propName }),
        );
    }
    for (const propName of ['d'] as (keyof typeof value)[]) {
        t.not(
            value[propName],
            origValueStruct[propName],
            inspectValue({ propName }),
        );
    }

    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        origValuePropStruct,
    );
    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        updatedValuePropStruct,
    );
    for (const propName of ['a', 'c', 'e']) {
        t.deepEqual(
            Object.getOwnPropertyDescriptor(value, propName),
            origValuePropStruct[propName],
            inspectValue({ propName }),
        );
    }
    for (const propName of ['b']) {
        t.notDeepEqual(
            Object.getOwnPropertyDescriptor(value, propName),
            origValuePropStruct[propName],
            inspectValue({ propName }),
        );
        t.notDeepEqual(
            Object.getOwnPropertyDescriptor(value, propName),
            updatedValuePropStruct[propName],
            inspectValue({ propName }),
        );
    }
    for (const propName of ['d']) {
        t.deepEqual(
            Object.getOwnPropertyDescriptor(value, propName),
            updatedValuePropStruct[propName],
            inspectValue({ propName }),
        );
    }
});

test('should skip new non-configurable object properties', t => {
    const value: Record<string, number> = { x: 1, y: 2 };
    const origValuePropStruct = Object.getOwnPropertyDescriptors(value);

    const state = new ObjectState(value);

    Object.assign(value, {
        newProp01: 11,
        newProp02: 12,
        newProp03: 13,
        newProp04: 14,
        newProp05: 15,
    });
    Object.defineProperties(value, {
        newProp02: { configurable: false },
        newProp04: { configurable: false },
    });
    const updatedValuePropStruct = Object.getOwnPropertyDescriptors(value);

    t.notDeepEqual(updatedValuePropStruct, origValuePropStruct);

    t.notThrows(() => state.rollback());

    t.deepEqual(Object.getOwnPropertyNames(value), [
        ...Object.getOwnPropertyNames(origValuePropStruct),
        'newProp02',
        'newProp04',
    ]);

    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        origValuePropStruct,
    );
    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        updatedValuePropStruct,
    );
    for (const propName of ['newProp02', 'newProp04']) {
        t.deepEqual(
            Object.getOwnPropertyDescriptor(value, propName),
            updatedValuePropStruct[propName],
            inspectValue({ propName }),
        );
    }
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

    Object.assign(value, {
        newProp01: 11,
        newProp02: 12,
        newProp03: 13,
        newProp04: 14,
        newProp05: 15,
    });
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
        newProp02: { configurable: false, writable: false },
        newProp04: { configurable: false, writable: false },
    });
    const updatedValuePropStruct = Object.getOwnPropertyDescriptors(value);

    t.notDeepEqual(value, origValueStruct);
    t.notDeepEqual(updatedValuePropStruct, origValuePropStruct);

    t.notThrows(() => state.rollback());

    t.deepEqual(Object.getOwnPropertyNames(value), [
        ...Object.getOwnPropertyNames(origValueStruct),
        'newProp02',
        'newProp04',
    ]);

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
    t.notDeepEqual(
        Object.getOwnPropertyDescriptors(value),
        updatedValuePropStruct,
    );
    for (const propName of ['a', 'c', 'e']) {
        t.deepEqual(
            Object.getOwnPropertyDescriptor(value, propName),
            origValuePropStruct[propName],
            inspectValue({ propName }),
        );
    }
    for (const propName of ['b', 'd']) {
        t.notDeepEqual(
            Object.getOwnPropertyDescriptor(value, propName),
            origValuePropStruct[propName],
            inspectValue({ propName }),
        );
        t.deepEqual(
            Object.getOwnPropertyDescriptor(value, propName),
            updatedValuePropStruct[propName],
            inspectValue({ propName }),
        );
    }
    for (const propName of ['newProp02', 'newProp04']) {
        t.deepEqual(
            Object.getOwnPropertyDescriptor(value, propName),
            updatedValuePropStruct[propName],
            inspectValue({ propName }),
        );
    }
});

test('should skip removed properties rollback to non-extensible objects', t => {
    const value = {
        a: 2,
        b: 7,
        c: 9,
        d: 16,
        e: 98,
    };
    const origValuePropStruct = Object.getOwnPropertyDescriptors(value);

    const state = new ObjectState(value);

    value.a = 1;
    delete value.b;
    value.c = 2;
    delete value.d;
    value.e = 3;
    Object.preventExtensions(value);

    t.notThrows(() => state.rollback());

    t.deepEqual<Record<string, TypedPropertyDescriptor<number>>>(
        Object.getOwnPropertyDescriptors(value),
        {
            a: origValuePropStruct.a,
            c: origValuePropStruct.c,
            e: origValuePropStruct.e,
        },
    );
});
