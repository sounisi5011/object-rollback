import { StateInterface, StateStaticInterface } from '.';
import ObjectState from './object';

const SetState: StateStaticInterface = class<
    K = unknown,
    V = unknown
> extends ObjectState<Map<K, V>> {
    static create(value: object): StateInterface | null {
        return value instanceof Map ? new this(value) : null;
    }

    private __entriesList: ReadonlyArray<readonly [K, V]>;

    private constructor(value: Map<K, V>) {
        super(value);
        this.__entriesList = [...value.entries()];
    }

    public rollback(): void {
        super.rollback();

        this.__value.clear();
        for (const [key, item] of this.__entriesList) {
            this.__value.set(key, item);
        }
    }

    protected __getChildValueList(): ReadonlyArray<unknown> {
        return [
            ...super.__getChildValueList(),
            ...this.__value.keys(),
            ...this.__value.values(),
        ];
    }
};

export default SetState;
