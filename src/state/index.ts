import ObjectState from './object';

export interface DefaultStateStaticInterface {
    new (value: object): StateInterface;
}

export interface StateStaticInterface extends DefaultStateStaticInterface {
    isTarget(value: object): boolean;
}

export interface StateInterface {
    rollback(): void;
    childObjectSet(): Set<object>;
}

export const defaultStateClass: DefaultStateStaticInterface = ObjectState;
export const stateClassList: ReadonlyArray<StateStaticInterface> = [];
