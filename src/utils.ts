export function isNotPrimitive(value: unknown): value is object {
    return value === Object(value);
}

export function getAllProperties(value: object): (string | symbol)[] {
    return [
        ...Object.getOwnPropertyNames(value),
        ...Object.getOwnPropertySymbols(value),
    ];
}

export function objectAllEntries<T>(
    value: Record<string | symbol, T>,
): [string | symbol, T][] {
    return getAllProperties(value).map(propName => [
        propName,
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore TS2538: Type 'symbol' cannot be used as an index type.
        value[propName],
    ]);
}
