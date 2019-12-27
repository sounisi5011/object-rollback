import { getAllProperties, isNotPrimitive, objectAllEntries } from './utils';

export class ObjectState {
    private __objectMap: WeakMap<
        object,
        {
            descMap: Map<string | symbol, PropertyDescriptor>;
            childObjectSet: Set<object>;
        }
    >;

    public constructor(...values: unknown[]) {
        this.__objectMap = new WeakMap();
        for (const value of values) {
            this.set(value);
        }
    }

    public set(value: unknown): this {
        if (isNotPrimitive(value)) {
            if (this.__objectMap.has(value)) {
                throw new Error('The specified value has already been set');
            }
            this.__set(value);
        }
        return this;
    }

    public rollback<T>(value: T): T {
        if (isNotPrimitive(value)) {
            if (!this.__objectMap.has(value)) {
                throw new RangeError(
                    'The specified value has not been set yet',
                );
            }
            this.__rollback(value);
        }
        return value;
    }

    private __set(value: object): void {
        if (this.__objectMap.has(value)) {
            return;
        }

        const descList = objectAllEntries(
            Object.getOwnPropertyDescriptors(value),
        );
        const descMap = new Map(descList);
        const childObjectSet = new Set(
            descList.map(([, desc]) => desc.value).filter(isNotPrimitive),
        );

        this.__objectMap.set(value, { descMap, childObjectSet });
        for (const childObject of childObjectSet) {
            this.__set(childObject);
        }
    }

    private __rollback(
        value: object,
        processingObjectSet: WeakSet<object> = new WeakSet(),
    ): void {
        if (processingObjectSet.has(value)) {
            return;
        }
        processingObjectSet.add(value);

        const data = this.__objectMap.get(value);
        if (!data) {
            return;
        }
        const { descMap, childObjectSet } = data;

        for (const propName of getAllProperties(value)) {
            if (!descMap.has(propName)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore TS7053: Element implicitly has an 'any' type because expression of type 'string | symbol' can't be used to index type '{}'. No index signature with a parameter of type 'string' was found on type '{}'.
                delete value[propName];
            }
        }
        for (const [propName, origDesc] of descMap) {
            Object.defineProperty(value, propName, origDesc);
        }

        for (const childObject of childObjectSet) {
            this.__rollback(childObject, processingObjectSet);
        }

        processingObjectSet.delete(value);
    }
}
