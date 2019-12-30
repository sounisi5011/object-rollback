import MapState from './map';
import ObjectState from './object';
import SetState from './set';

export interface DefaultStateStaticInterface {
    new (value: object): StateInterface;
}

export interface StateStaticInterface {
    create(value: object): StateInterface | null;
}

export interface StateInterface {
    rollback(): void;
    childObjectSet(): Set<object>;
}

export const DefaultStateClass: DefaultStateStaticInterface = ObjectState;
export const stateClassList: ReadonlyArray<StateStaticInterface> = [
    MapState,
    SetState,
];
