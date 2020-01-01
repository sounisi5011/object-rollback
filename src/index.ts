import { DefaultStateClass, stateClassList, StateInterface } from './state';
import { freezeProperties, isNotPrimitive } from './utils';

export class ObjectState<T> {
    private readonly __value: T;
    private readonly __objectStateMap: WeakMap<object, StateInterface>;

    public constructor(value: T) {
        const argsLen = arguments.length;
        const className = new.target.name;
        if (argsLen < 1) {
            throw new TypeError(`Constructor ${className} requires 1 argument`);
        } else if (argsLen > 1) {
            throw new TypeError(
                `Constructor ${className} requires only 1 argument`,
            );
        }

        this.__value = value;
        this.__objectStateMap = new WeakMap();
        freezeProperties(this, ['__value', '__objectStateMap']);

        if (isNotPrimitive(value)) {
            this.__set(value);
        }
    }

    public rollback(): T {
        if (isNotPrimitive(this.__value)) {
            this.__rollback(this.__value);
        }
        return this.__value;
    }

    private __set(value: object): void {
        if (this.__objectStateMap.has(value)) {
            return;
        }

        const state =
            stateClassList.reduce<StateInterface | null>(
                (state, stateClass) => state || stateClass.create(value),
                null,
            ) || new DefaultStateClass(value);

        this.__objectStateMap.set(value, state);
        for (const childObject of state.childObjects) {
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

        const state = this.__objectStateMap.get(value);
        if (!state) {
            return;
        }

        state.rollback();
        for (const childObject of state.childObjects) {
            this.__rollback(childObject, processingObjectSet);
        }

        processingObjectSet.delete(value);
    }
}
