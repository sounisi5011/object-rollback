export const boolean = [true, false];

export const number = [
    0,
    -0,
    1,
    -2,
    Math.PI,
    -Math.SQRT2,
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_VALUE,
    Number.MIN_VALUE,
    Number.EPSILON,
    Infinity,
    -Infinity,
    NaN,
];

/**
 * BigInt is supported from Node.js 10.4.0+
 * @see https://node.green/#ES2020-features-BigInt
 */
export const bigint =
    typeof BigInt === 'function'
        ? [
              ...new Set(
                  number
                      .filter(Number.isSafeInteger)
                      // eslint-disable-next-line no-undef
                      .map(BigInt),
              ),
              BigInt(2) ** BigInt(60), // eslint-disable-line no-undef
              -(BigInt(2) ** BigInt(60)), // eslint-disable-line no-undef
          ]
        : [];

export const string = ['', 'foo'];

export const symbol = [
    Symbol(), // eslint-disable-line symbol-description
    Symbol('bar'),
    Symbol.iterator,
];

export default [
    undefined,
    null,
    ...boolean,
    ...number,
    ...bigint,
    ...string,
    ...symbol,
];
