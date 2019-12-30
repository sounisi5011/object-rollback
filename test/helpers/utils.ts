import util from 'util';

function getAllPrototype(value: unknown): unknown[] {
    const prototypeList = [];
    let proto = value;
    while (true) {
        proto = Object.getPrototypeOf(proto);
        if (!proto) {
            break;
        }
        prototypeList.push(proto);
    }
    return prototypeList;
}

export function getAllPropertyNames<T>(value: T): (keyof T)[] {
    return [
        ...new Set(
            [value, ...getAllPrototype(value)].reduce<(keyof T)[]>(
                (propList, obj) => [
                    ...propList,
                    ...(Object.getOwnPropertyNames(obj) as (keyof T)[]),
                ],
                [],
            ),
        ),
    ];
}

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
