import { StateInterface, StateStaticInterface } from '.';
import ObjectState from './object';

const DateState: StateStaticInterface = class extends ObjectState<Date> {
    static create(value: object): StateInterface | null {
        return value instanceof Date ? new this(value) : null;
    }

    private readonly __unixtime: number;

    private constructor(value: Date) {
        super(value);
        this.__unixtime = value.getTime();
    }

    public rollback(): void {
        super.rollback();
        this.__value.setTime(this.__unixtime);
    }
};

export default DateState;
