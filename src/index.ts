import { DefaultStateClass, stateClassList, StateInterface } from './state';
import { isNotPrimitive } from './utils';

export class ObjectState {
    private __objectStateMap: WeakMap<object, StateInterface>;

    public constructor(...values: unknown[]) {
        this.__objectStateMap = new WeakMap();
        for (const value of values) {
            this.set(value);
        }
    }

    public set(value: unknown): this {
        if (isNotPrimitive(value)) {
            if (this.__objectStateMap.has(value)) {
                throw new Error('The specified value has already been set');
            }
            this.__set(value);
        }
        return this;
    }

    public rollback<T>(value: T): T {
        if (isNotPrimitive(value)) {
            if (!this.__objectStateMap.has(value)) {
                throw new RangeError(
                    'The specified value has not been set yet',
                );
            }
            this.__rollback(value);
        }
        return value;
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
        for (const childObject of state.childObjectSet()) {
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
        for (const childObject of state.childObjectSet()) {
            this.__rollback(childObject, processingObjectSet);
        }

        processingObjectSet.delete(value);
    }
}
