import { StateInterface, StateStaticInterface } from '.';
import ObjectState from './object';

const SetState: StateStaticInterface = class<T = unknown> extends ObjectState<
    Set<T>
> {
    static create(value: object): StateInterface | null {
        return value instanceof Set ? new this(value) : null;
    }

    private __itemList: ReadonlyArray<T>;

    private constructor(value: Set<T>) {
        super(value);
        this.__itemList = [...value.values()];
    }

    public rollback(): void {
        super.rollback();

        this.__value.clear();
        for (const item of this.__itemList) {
            this.__value.add(item);
        }
    }
};

export default SetState;