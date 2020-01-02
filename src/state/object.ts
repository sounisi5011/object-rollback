import { getAllProperties, isNotPrimitive, objectAllEntries } from '../utils';
import { StateInterface } from '.';

export default class<T extends object = object> implements StateInterface {
    public childObjects: ReadonlySet<object>;
    protected __value: T;
    private __propDescMap: ReadonlyMap<string | symbol, PropertyDescriptor>;

    public constructor(value: T) {
        this.__value = value;
        this.__propDescMap = new Map(
            objectAllEntries(Object.getOwnPropertyDescriptors(value)),
        );
        this.childObjects = new Set(
            this.__getChildValueList().filter(isNotPrimitive),
        );
    }

    public rollback(): void {
        for (const propName of getAllProperties(this.__value)) {
            if (!this.__propDescMap.has(propName)) {
                Reflect.deleteProperty(this.__value, propName);
            }
        }
        for (const [propName, origDesc] of this.__propDescMap) {
            this.__rollbackProperty(this.__value, propName, origDesc);
        }
    }

    protected __getChildValueList(): ReadonlyArray<unknown> {
        return [...this.__propDescMap.values()].map(desc => desc.value);
    }

    private __rollbackProperty(
        value: T,
        propName: string | symbol,
        origDesc: PropertyDescriptor,
    ): void {
        const currentDesc = Object.getOwnPropertyDescriptor(value, propName);
        if (!currentDesc) {
            if (Object.isExtensible(value)) {
                Object.defineProperty(value, propName, origDesc);
            }
        } else if (currentDesc.configurable) {
            Object.defineProperty(value, propName, origDesc);
        } else if (
            currentDesc.writable &&
            Object.prototype.hasOwnProperty.call(origDesc, 'value')
        ) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore TS7053: Element implicitly has an 'any' type because expression of type 'string | symbol' can't be used to index type '{}'.
            //                    No index signature with a parameter of type 'string' was found on type '{}'.
            value[propName] = origDesc.value;
        }
    }
}
