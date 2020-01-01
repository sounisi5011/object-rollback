import test from 'ava';
import url from 'url';

import { ObjectState } from '../../src';

const WHATWG_URL = typeof URL === 'function' ? URL : url.URL;

const queryParametersUpdateCallbackMap = new Map<string, (value: URL) => void>([
    [
        'Assign url.search',
        url => {
            url.search = url.search; // eslint-disable-line no-self-assign
        },
    ],
    [
        'Update url.searchParams',
        url => {
            let name: string;
            do {
                name = String(Math.random());
            } while (url.searchParams.has(name));
            url.searchParams.delete(name);
        },
    ],
]);

test(`if URL's username is empty, the URL object should not remove the ":" at initialize`, t => {
    // Note: If this test fails, the specification of the built-in URL object has changed.
    t.is(
        String(new WHATWG_URL('https://:password@example.com/path')),
        'https://:password@example.com/path',
    );
});

test(`if URL's password is empty, the URL object should remove the ":" at initialize`, t => {
    // Note: If this test fails, the specification of the built-in URL object has changed.
    t.is(
        String(new WHATWG_URL('https://username:@example.com/path')),
        'https://username@example.com/path',
    );
});

test(`if URL's port is empty, the URL object should remove the ":" at initialize`, t => {
    // Note: If this test fails, the specification of the built-in URL object has changed.
    t.is(
        String(new WHATWG_URL('https://example.com:/path')),
        'https://example.com/path',
    );
});

test(`if there is no "/" separating URL's domain and path, the URL object should add "/" at initialize`, t => {
    const url = new WHATWG_URL('https://example.com');

    // Note: If this test fails, the specification of the built-in URL object has changed.
    t.is(String(url), 'https://example.com/');
    t.is(url.pathname, '/');
});

test('should rollback "?" in URL object query string', t => {
    const origURL = 'https://example.com/path?';
    const value = new WHATWG_URL(origURL);

    // Note: If this test fails, the specification of the built-in URL object has changed.
    t.is(
        String(value),
        origURL,
        `if URL's query is empty, the URL object should not remove the "?" at initialize`,
    );

    const state = new ObjectState(value);

    for (const [testName, callback] of queryParametersUpdateCallbackMap) {
        callback(value);
        t.not(String(value), origURL, testName);

        state.rollback();
        t.is(String(value), origURL, testName);
    }
});

test('should not prepend "?" in query string when rollback URL object', t => {
    const origURL = 'https://example.com/path';
    const value = new WHATWG_URL(origURL);

    // Note: If this test fails, the specification of the built-in URL object has changed.
    t.is(
        String(value),
        origURL,
        `if URL's query is empty, the URL object should not add the "?" at initialize`,
    );

    const state = new ObjectState(value);

    for (const [testName, callback] of queryParametersUpdateCallbackMap) {
        callback(value);
        t.is(String(value), origURL, testName);

        state.rollback();
        t.is(String(value), origURL, testName);
    }
});

test('should rollback "#" in URL object fragment', t => {
    const origURL = 'https://example.com/path#';
    const value = new WHATWG_URL(origURL);

    // Note: If this test fails, the specification of the built-in URL object has changed.
    t.is(
        String(value),
        origURL,
        `if URL's fragment is empty, the URL object should not remove the "#" at initialize`,
    );

    const state = new ObjectState(value);

    value.hash = value.hash; // eslint-disable-line no-self-assign
    t.not(String(value), origURL);

    state.rollback();
    t.is(String(value), origURL);
});

test('should not prepend "#" in fragment when rollback URL object', t => {
    const origURL = 'https://example.com/path';
    const value = new WHATWG_URL(origURL);

    // Note: If this test fails, the specification of the built-in URL object has changed.
    t.is(
        String(value),
        origURL,
        `if URL's fragment is empty, the URL object should not add the "#" at initialize`,
    );

    const state = new ObjectState(value);

    value.hash = value.hash; // eslint-disable-line no-self-assign
    t.is(String(value), origURL);

    state.rollback();
    t.is(String(value), origURL);
});
