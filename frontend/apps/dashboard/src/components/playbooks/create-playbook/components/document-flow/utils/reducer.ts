import type { NameFormData } from '../../name-step';
import type { DocumentsDetailsFormData } from '../components/step-document-details';

export type Step = 'name' | 'details';

export type State = {
  step: Step;
  data: {
    nameForm: NameFormData;
    detailsForm: DocumentsDetailsFormData;
  };
};

export type Action =
  | { type: 'updateStep'; payload: Step }
  | { type: 'updateNameData'; payload: Partial<NameFormData> }
  | { type: 'updateDetailsData'; payload: Partial<DocumentsDetailsFormData> }
  | { type: 'navigateStep'; payload: string };

export const initialState: State = {
  step: 'name',
  data: {
    nameForm: {
      name: '',
    },
    detailsForm: {
      docs: {
        poa: false,
        possn: false,
        custom: [],
        requireManualReview: false,
      },
      gov: {
        country: {},
        global: [],
        selfie: true,
        idDocFirst: false,
      },
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
