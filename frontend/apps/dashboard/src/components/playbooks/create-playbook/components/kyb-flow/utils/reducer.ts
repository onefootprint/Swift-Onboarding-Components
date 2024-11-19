import type { NameFormData } from '../../name-step';
import type { RequiredAuthMethodsFormData } from '../../required-auth-methods-step';
import type { BoFormData } from '../components/bo-step';
import type { BusinessFormData } from '../components/business-step';
import type { VerificationChecksFormData } from '../components/verification-checks-step';
import { defaultFormValues } from './get-default-form-values';

export type Step = 'name' | 'details' | 'business' | 'bo' | 'requiredAuthMethods' | 'verificationChecks';

export type State = {
  step: Step;
  data: {
    nameForm: NameFormData;
    businessForm: BusinessFormData;
    boForm: BoFormData;
    requiredAuthMethodsForm: RequiredAuthMethodsFormData;
    verificationChecksForm: VerificationChecksFormData;
  };
};

export type Action =
  | { type: 'updateStep'; payload: Step }
  | { type: 'updateNameData'; payload: Partial<NameFormData> }
  | { type: 'updateBusinessData'; payload: Partial<BusinessFormData> }
  | { type: 'updateBOData'; payload: Partial<BoFormData> }
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
    case 'updateBusinessData':
      return {
        ...state,
        data: {
          ...state.data,
          businessForm: {
            ...state.data.businessForm,
            ...action.payload,
          },
          verificationChecksForm: {
            ...state.data.verificationChecksForm,
            kybKind: action.payload.data?.address ? 'full' : 'ein',
          },
        },
      };
    case 'updateBOData':
      return {
        ...state,
        data: {
          ...state.data,
          boForm: {
            ...state.data.boForm,
            ...action.payload,
          },
          verificationChecksForm: {
            ...state.data.verificationChecksForm,
            runKyc: !!action.payload.data?.collect,
            aml: defaultFormValues.verificationChecksForm.aml,
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
