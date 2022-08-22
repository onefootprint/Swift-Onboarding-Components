import { useReducer } from 'react';
import { CollectedDataOption } from 'src/types';

import type { DataKindForm } from '../create-onboarding-config.types';

export enum Actions {
  next = 'NEXT',
  back = 'BACK',
  reset = 'RESET',
}

type Action =
  | { type: Actions.next; payload: { data: any } }
  | { type: Actions.back }
  | { type: Actions.reset };

type State = {
  step: number;
  data: {
    name: string;
    collect: DataKindForm;
  };
};

const initialState = {
  step: 0,
  data: {
    name: '',
    collect: {
      [CollectedDataOption.email]: true,
      [CollectedDataOption.phoneNumber]: true,
    },
  },
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case Actions.next:
      return {
        ...state,
        step: state.step + 1,
        data: {
          ...state.data,
          ...action.payload.data,
        },
      };
    case Actions.back:
      return {
        ...state,
        step: state.step - 1,
      };
    case Actions.reset:
      return initialState;
    default:
      throw new Error();
  }
};

const getFormId = (step: number) => {
  if (step === 0) {
    return 'name-form';
  }
  if (step === 1) {
    return 'collect-form';
  }
  return 'access-form';
};

const useCreateState = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return [{ ...state, formId: getFormId(state.step) }, dispatch] as const;
};
export default useCreateState;
