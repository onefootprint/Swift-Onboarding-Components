import type { NameFormData } from '../../name-step';
import type { AuthDetailsFormData } from '../components/auth-details-step';

export type Step = 'name' | 'details';

export type State = {
  step: Step;
  data: {
    nameForm: NameFormData;
    authDetailsForm: AuthDetailsFormData;
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
    authDetailsForm: {
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
          authDetailsForm: {
            ...state.data.authDetailsForm,
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
