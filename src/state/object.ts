import { getAllProperties, isNotPrimitive, objectAllEntries } from '../utils';
import { StateInterface } from '.';

export default class implements StateInterface {
    private __value: object;
    private __propDescMap: Map<string | symbol, PropertyDescriptor>;
    private __childObjectSet: Set<object> | null = null;

    public constructor(value: object) {
        this.__value = value;
        this.__propDescMap = new Map(
            objectAllEntries(Object.getOwnPropertyDescriptors(value)),
        );
    }

    public rollback(): void {
        for (const propName of getAllProperties(this.__value)) {
            if (!this.__propDescMap.has(propName)) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                // @ts-ignore TS7053: Element implicitly has an 'any' type because expression of type 'string | symbol' can't be used to index type '{}'.
                //                    No index signature with a parameter of type 'string' was found on type '{}'.
                delete this.__value[propName];
            }
        }
        for (const [propName, origDesc] of this.__propDescMap) {
            Object.defineProperty(this.__value, propName, origDesc);
        }
    }

    public childObjectSet(): Set<object> {
        if (!this.__childObjectSet) {
            this.__childObjectSet = new Set(
                [...this.__propDescMap.values()]
                    .map(desc => desc.value)
                    .filter(isNotPrimitive),
            );
        }
        return this.__childObjectSet;
    }
}
