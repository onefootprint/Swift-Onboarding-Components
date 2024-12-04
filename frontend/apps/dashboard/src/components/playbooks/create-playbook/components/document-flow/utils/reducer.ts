import type { CustomDocumentConfig, OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import type { NameFormData } from '../../name-step';
import type { DocumentsDetailsFormData } from '../components/step-document-details';

export type Step = 'name' | 'details' | 'reviewChanges';

export type State = {
  step: Step;
  data: {
    nameForm: NameFormData;
    detailsForm: DocumentsDetailsFormData;
  };
};

export type StateFormData = State['data'];

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

export const getInitialValues = (playbook?: OnboardingConfiguration): State => {
  if (!playbook) return initialState;

  return {
    step: 'name',
    data: {
      nameForm: {
        name: playbook.name,
      },
      detailsForm: {
        docs: {
          poa: playbook.documentsToCollect.some(doc => doc.kind === 'proof_of_address'),
          possn: playbook.documentsToCollect.some(doc => doc.kind === 'proof_of_ssn'),
          custom: playbook.documentsToCollect
            .map(doc => {
              if (doc.kind === 'custom') {
                return {
                  name: doc.data.name,
                  // We append the prefix in the form
                  // if we don't remove here we would need to handle differently from the create flow
                  identifier: doc.data.identifier.replace('document.custom.', ''),
                  description: doc.data.description,
                  requiresHumanReview: doc.data.requiresHumanReview,
                  uploadSettings: doc.data.uploadSettings,
                } as CustomDocumentConfig;
              }
              return null;
            })
            .filter((doc): doc is CustomDocumentConfig => doc !== null),
          requireManualReview: playbook.documentsToCollect.some(doc => {
            if (doc.kind === 'proof_of_address' && doc.data.requiresHumanReview) {
              return true;
            }
            if (doc.kind === 'proof_of_ssn' && doc.data.requiresHumanReview) {
              return true;
            }
            if (doc.kind === 'custom' && doc.data.requiresHumanReview) {
              return true;
            }
            return false;
          }),
        },
        gov: {
          country: playbook.documentTypesAndCountries?.countrySpecific || {},
          global: playbook.documentTypesAndCountries?.global || [],
          // @ts-expect-error this was deprecated
          selfie: playbook.mustCollectData.includes('document_and_selfie'),
          idDocFirst: playbook.isDocFirstFlow,
        },
      },
    },
  };
};
