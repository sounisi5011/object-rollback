import { StateInterface, StateStaticInterface } from '.';
import ObjectState from './object';

const DataViewState: StateStaticInterface = class extends ObjectState<
    DataView
> {
    static create(value: object): StateInterface | null {
        return value instanceof DataView ? new this(value) : null;
    }

    private __origDataView: DataView;

    private constructor(value: DataView) {
        super(value);
        this.__origDataView = new DataView(value.buffer.slice(0));
    }

    public rollback(): void {
        super.rollback();

        const byteLength = this.__origDataView.byteLength;
        for (let byteOffset = 0; byteOffset < byteLength; byteOffset++) {
            this.__value.setUint8(
                byteOffset,
                this.__origDataView.getUint8(byteOffset),
            );
        }
    }
};

export default DataViewState;
