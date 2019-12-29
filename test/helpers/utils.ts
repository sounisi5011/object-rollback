import util from 'util';

export function sortList<T>(
    list: Iterable<T>,
    compareFn?: (a: T, b: T) => number,
): T[] {
    return [...list].sort(compareFn);
}

export function inspectValue(
    value: unknown,
    {
        filstLineOnly = false,
        ...options
    }: util.InspectOptions & { filstLineOnly?: boolean } = {},
): string {
    if (filstLineOnly) {
        return (inspectValue(value, options).match(/^[^\r\n]+/) || [''])[0];
    }
    return util.inspect(value, { breakLength: Infinity, ...options });
}
