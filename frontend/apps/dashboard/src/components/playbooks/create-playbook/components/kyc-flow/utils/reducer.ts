import type { NameFormData } from '../../name-step';
import type { RequiredAuthMethodsFormData } from '../../required-auth-methods-step';
import type { ResidencyFormData } from '../../residency-step';
import type { DetailsFormData } from '../components/details-step';
import type { OnboardingTemplate, TemplatesFormData } from '../components/templates-step';
import type { VerificationChecksFormData } from '../components/verification-checks-step';
import { defaultFormValues, templateValues } from './get-default-form-values';

export type Step =
  | 'name'
  | 'templates'
  | 'details'
  | 'residency'
  | 'kycData'
  | 'requiredAuthMethods'
  | 'verificationChecks';

export type State = {
  step: Step;
  data: {
    nameForm: NameFormData;
    templateForm: TemplatesFormData;
    residencyForm: ResidencyFormData;
    detailsForm: DetailsFormData;
    requiredAuthMethodsForm: RequiredAuthMethodsFormData;
    verificationChecksForm: VerificationChecksFormData;
  };
};

export type Action =
  | { type: 'updateStep'; payload: Step }
  | { type: 'updateNameData'; payload: Partial<NameFormData> }
  | { type: 'updateTemplateData'; payload: Partial<TemplatesFormData> }
  | { type: 'updateResidencyData'; payload: Partial<ResidencyFormData> }
  | { type: 'updateDetailsData'; payload: Partial<DetailsFormData> }
  | { type: 'updateRequiredAuthMethodsData'; payload: Partial<RequiredAuthMethodsFormData> }
  | { type: 'updateVerificationChecksData'; payload: Partial<VerificationChecksFormData> }
  | { type: 'navigateStep'; payload: string };

export const initialState: State = {
  step: 'name',
  data: defaultFormValues,
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
    case 'updateTemplateData': {
      if (action.payload.template !== state.data.templateForm.template) {
        const templateData = templateValues[action.payload.template as OnboardingTemplate];
        return {
          ...state,
          data: {
            ...state.data,
            ...templateData,
            templateForm: {
              ...state.data.templateForm,
              ...action.payload,
            },
          },
        };
      }
      return state;
    }
    case 'updateResidencyData':
      return {
        ...state,
        data: {
          ...state.data,
          residencyForm: {
            ...state.data.residencyForm,
            ...action.payload,
          },
          verificationChecksForm: {
            ...state.data.verificationChecksForm,
            runKyc: action.payload.residencyType === 'us',
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
    case 'updateRequiredAuthMethodsData':
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
    case 'updateVerificationChecksData':
      return {
        ...state,
        data: {
          ...state.data,
          verificationChecksForm: {
            ...state.data.verificationChecksForm,
            ...action.payload,
          },
        },
      };
    case 'navigateStep':
      if (state.step !== action.payload) {
        return { ...state, step: action.payload as Step };
      }
      return state;
    default:
      return state;
  }
};
