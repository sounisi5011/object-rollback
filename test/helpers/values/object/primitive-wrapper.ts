import {
    boolean as boolArray,
    number as numArray,
    string as strArray,
} from '../primitive';

/* eslint-disable no-new-wrappers */

export const boolean = boolArray.map(bool => new Boolean(bool));

export const number = numArray.map(num => new Number(num));

export const string = strArray.map(str => new String(str));

/* eslint-enable */

export default [...boolean, ...number, ...string];
