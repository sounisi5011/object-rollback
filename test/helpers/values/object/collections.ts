import { symbol } from '../primitive';

export default [
    new Map(),
    new Map<number | string, string | number>([
        [1, 'hoge'],
        ['x', 'fuga'],
        [
            'Answer to the Ultimate Question of Life, the Universe, and Everything',
            42,
        ],
    ]),
    new Set(),
    new Set(symbol),
    new WeakMap(),
    new WeakSet(),
];
