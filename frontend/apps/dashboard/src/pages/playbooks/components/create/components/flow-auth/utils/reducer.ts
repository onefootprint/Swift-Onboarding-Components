import type { AuthDetailsFormData } from '../../step-auth-details';
import type { NameFormData } from '../../step-name';

export type Step = 'name' | 'details';

export type State = {
  step: Step;
  data: {
    nameForm: NameFormData;
    detailsForm: AuthDetailsFormData;
  };
};

export type Action =
  | { type: 'updateStep'; payload: Step }
  | { type: 'updateNameData'; payload: Partial<NameFormData> }
  | { type: 'updateDetailsData'; payload: Partial<AuthDetailsFormData> }
  | { type: 'navigateStep'; payload: string };

export const initialState: State = {
  step: 'name',
  data: {
    nameForm: {
      name: '',
    },
    detailsForm: {
      email: false,
      phone: true,
    },
  },
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'updateStep':
      return { ...state, step: action.payload };
    case 'updateNameData':
      return {
        ...state,
        data: {
          ...state.data,
          nameForm: {
            ...state.data.nameForm,
            ...action.payload,
          },
        },
      };
    case 'updateDetailsData':
      return {
        ...state,
        data: {
          ...state.data,
          detailsForm: {
            ...state.data.detailsForm,
            ...action.payload,
          },
        },
      };
    case 'navigateStep':
      if (action.payload === 'name' && state.step === 'details') {
        return { ...state, step: 'name' };
      }
      return state;
    default:
      return state;
  }
};
