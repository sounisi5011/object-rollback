import arrays from './array';
import buffers from './buffer';
import collections from './collections';
import dates from './date';
import errors from './error';
import functions from './functions';
import plainObjects from './plain';
import primitiveWrappers from './primitive-wrapper';
import regexps from './regexp';

export default [
    ...plainObjects,
    ...arrays,
    ...functions,
    ...regexps,
    ...collections,
    ...errors,
    ...dates,
    ...buffers,
    ...primitiveWrappers,
];
