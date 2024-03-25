import { useReducer } from 'react';

type OverlayId = `${keyof State}`;
type StateToggler = State & Record<`${OverlayId}Toggle`, () => void>;
type Actions = { id: OverlayId; open: boolean };
type State = {
  docAdditional?: boolean;
  docAssign?: boolean;
  docTimeline?: boolean;
};

const reducer = (state: State, { id, open }: Actions): State =>
  id in state ? { ...state, [id]: open } : state;

const useOverlayState = (initialState: State) => {
  const [state, setState] = useReducer(reducer, initialState);

  return Object.keys(state).reduce<StateToggler>((acc, strId) => {
    const id = strId as OverlayId;

    acc[`${id}Toggle`] = (open?: boolean) =>
      typeof open === 'boolean'
        ? setState({ id, open })
        : setState({ id, open: !state[id] });

    return acc;
  }, state as StateToggler);
};

export default useOverlayState;
