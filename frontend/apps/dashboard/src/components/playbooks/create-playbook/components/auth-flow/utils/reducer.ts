import type { OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import type { NameFormData } from '../../name-step';
import type { RequiredAuthMethodsFormData } from '../components/required-auth-methods-step';

export type Step = 'name' | 'details' | 'reviewChanges';

export type State = {
  step: Step;
  data: {
    nameForm: NameFormData;
    requiredAuthMethodsForm: RequiredAuthMethodsFormData;
  };
};

export type StateFormData = State['data'];

export type Action =
  | { type: 'updateStep'; payload: Step }
  | { type: 'updateNameData'; payload: Partial<NameFormData> }
  | { type: 'updateDetailsData'; payload: Partial<RequiredAuthMethodsFormData> }
  | { type: 'navigateStep'; payload: string };

export const initialState: State = {
  step: 'name',
  data: {
    nameForm: {
      name: '',
    },
    requiredAuthMethodsForm: {
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
          requiredAuthMethodsForm: {
            ...state.data.requiredAuthMethodsForm,
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

export const getInitialValues = (playbook?: OnboardingConfiguration): State => {
  if (!playbook) return initialState;

  return {
    step: 'name',
    data: {
      nameForm: {
        name: playbook.name,
      },
      requiredAuthMethodsForm: {
        email: playbook.requiredAuthMethods?.includes('email') || false,
        phone: playbook.requiredAuthMethods?.includes('phone') || false,
      },
    },
  };
};
