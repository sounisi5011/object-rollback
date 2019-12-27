import util from 'util';

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
