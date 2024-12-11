import type { CustomDocumentConfig, OnboardingConfiguration } from '@onefootprint/request-types/dashboard';
import type { NameFormData } from '../../name-step';
import type { RequiredAuthMethodsFormData } from '../../required-auth-methods-step';
import type { BoFormData } from '../components/bo-step';
import type { BusinessFormData } from '../components/business-step';
import type { VerificationChecksFormData } from '../components/verification-checks-step';
import { defaultFormValues } from './get-default-form-values';

export type Step =
  | 'name'
  | 'details'
  | 'business'
  | 'bo'
  | 'requiredAuthMethods'
  | 'verificationChecks'
  | 'reviewChanges';

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

export type StateFormData = State['data'];

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
            runKyb: !!action.payload.data?.tin,
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

export const getInitialValues = (playbook?: OnboardingConfiguration): State => {
  if (!playbook) return initialState;

  return {
    step: 'name',
    data: {
      ...defaultFormValues,
      nameForm: {
        name: playbook.name,
      },
      businessForm: {
        data: {
          address: playbook.mustCollectData.includes('business_address'),
          collectBOInfo: playbook.mustCollectData.includes('business_kyced_beneficial_owners'),
          name: playbook.mustCollectData.includes('business_name'),
          phoneNumber: playbook.mustCollectData.includes('business_phone_number'),
          tin: playbook.mustCollectData.includes('business_tin'),
          type: playbook.mustCollectData.includes('business_corporation_type'),
          website: playbook.mustCollectData.includes('business_website'),
        },
        docs: {
          custom: playbook.businessDocumentsToCollect
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
        },
      },
      boForm: {
        data: {
          collect: playbook.mustCollectData.includes('business_kyced_beneficial_owners'),
          address: playbook.mustCollectData.includes('full_address'),
          dob: playbook.mustCollectData.includes('dob'),
          email: playbook.mustCollectData.includes('email'),
          phoneNumber: playbook.mustCollectData.includes('phone_number'),
          ssn: {
            collect:
              playbook.mustCollectData.includes('ssn4') ||
              playbook.mustCollectData.includes('ssn9') ||
              playbook.optionalData.includes('ssn4') ||
              playbook.optionalData.includes('ssn9'),
            kind: playbook.mustCollectData.includes('ssn4') || playbook.optionalData.includes('ssn4') ? 'ssn4' : 'ssn9',
            optional: playbook.optionalData.includes('ssn4') || playbook.optionalData.includes('ssn9'),
          },
          usLegalStatus: playbook.mustCollectData.includes('us_legal_status'),
          usTaxIdAcceptable: playbook.mustCollectData.includes('us_tax_id'),
        },
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
          // @ts-expect-error: this was deprecated
          selfie: playbook.mustCollectData.includes('document_and_selfie'),
          idDocFirst: playbook.isDocFirstFlow,
        },
      },
      requiredAuthMethodsForm: {
        email: playbook.requiredAuthMethods?.includes('email') || false,
        phone: playbook.requiredAuthMethods?.includes('phone') || false,
      },
      verificationChecksForm: {
        runKyc: playbook.verificationChecks.some(c => c.kind === 'kyc'),
        runKyb: playbook.verificationChecks.some(c => c.kind === 'kyb'),
        kybKind: playbook.verificationChecks.some(c => c.kind === 'kyb' && c.data.einOnly) ? 'ein' : 'full',
        businessAml: playbook.verificationChecks.some(c => c.kind === 'business_aml'),
      },
    },
  };
};
