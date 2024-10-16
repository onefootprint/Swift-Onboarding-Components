import type { KycFormData } from '../../person-data';
import type { KycTemplatesFormData, OnboardingTemplate } from '../../step-kyc-templates';
import type { KycVerificationChecksFormData } from '../../step-kyc-verification-checks';
import type { NameFormData } from '../../step-name';
import type { RequiredAuthMethodsFormData } from '../../step-required-auth-methods';
import type { ResidencyFormData } from '../../step-residency';
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
    templateForm: KycTemplatesFormData;
    residencyForm: ResidencyFormData;
    kycForm: KycFormData;
    requiredAuthMethodsForm: RequiredAuthMethodsFormData;
    verificationChecksForm: KycVerificationChecksFormData;
  };
};

export type Action =
  | { type: 'updateStep'; payload: Step }
  | { type: 'updateNameData'; payload: Partial<NameFormData> }
  | { type: 'updateTemplateData'; payload: Partial<KycTemplatesFormData> }
  | { type: 'updateResidencyData'; payload: Partial<ResidencyFormData> }
  | { type: 'updateKycData'; payload: Partial<KycFormData> }
  | { type: 'updateRequiredAuthMethodsData'; payload: Partial<RequiredAuthMethodsFormData> }
  | { type: 'updateVerificationChecksData'; payload: Partial<KycVerificationChecksFormData> }
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
    case 'updateKycData':
      return {
        ...state,
        data: {
          ...state.data,
          kycForm: {
            ...state.data.kycForm,
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
