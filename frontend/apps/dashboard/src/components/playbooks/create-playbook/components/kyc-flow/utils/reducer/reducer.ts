import type {
  AmlMatchKind,
  CipKind,
  CustomDocumentConfig,
  OnboardingConfiguration,
} from '@onefootprint/request-types/dashboard';
import type { NameFormData } from '../../../name-step';
import type { RequiredAuthMethodsFormData } from '../../../required-auth-methods-step';
import type { ResidencyFormData } from '../../../residency-step';
import type { DetailsFormData } from '../../components/details-step';
import { OnboardingTemplate, type TemplatesFormData } from '../../components/templates-step';
import type { VerificationChecksFormData } from '../../components/verification-checks-step';
import { defaultFormValues, templateValues } from '../get-default-form-values';

export type Step =
  | 'name'
  | 'templates'
  | 'details'
  | 'residency'
  | 'kycData'
  | 'requiredAuthMethods'
  | 'verificationChecks'
  | 'reviewChanges';

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

export type StateFormData = State['data'];

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

export const getInitialValues = (playbook?: OnboardingConfiguration): State => {
  if (!playbook) return initialState;

  const getTemplate = (cipKind?: CipKind) => {
    if (!cipKind) return OnboardingTemplate.Custom;
    return cipKind === 'alpaca' ? OnboardingTemplate.Alpaca : OnboardingTemplate.Apex;
  };

  const getVerificationChecks = (playbook: OnboardingConfiguration): VerificationChecksFormData => {
    const amlCheck = playbook.verificationChecks.find(c => c.kind === 'aml');

    const getMatchingMethod = (
      matchingMethod: AmlMatchKind = 'fuzzy_low',
    ): VerificationChecksFormData['aml']['matchingMethod'] => {
      const isFuzzy = matchingMethod.startsWith('fuzzy');

      const getFuzzyLevel = () => {
        if (matchingMethod === 'fuzzy_low' || matchingMethod === 'fuzzy_medium' || matchingMethod === 'fuzzy_high') {
          return matchingMethod;
        }
        return 'fuzzy_low';
      };

      const getExactLevel = () => {
        if (matchingMethod === 'exact_name' || matchingMethod === 'exact_name_and_dob_year') {
          return matchingMethod;
        }
        return 'exact_name';
      };

      return {
        kind: isFuzzy ? 'fuzzy' : 'exact',
        fuzzyLevel: getFuzzyLevel(),
        exactLevel: getExactLevel(),
      };
    };

    return {
      runKyc: playbook.verificationChecks.some(c => c.kind === 'kyc'),
      isNeuroEnabled: playbook.verificationChecks.some(c => c.kind === 'neuro_id'),
      isSentilinkEnabled: playbook.verificationChecks.some(c => c.kind === 'sentilink'),
      aml: {
        enhancedAml: Boolean(amlCheck),
        ofac: Boolean(amlCheck?.data.ofac),
        pep: Boolean(amlCheck?.data.pep),
        adverseMedia: Boolean(amlCheck?.data.adverseMedia),
        adverseMediaList: {
          financial_crime: Boolean(amlCheck?.data.adverseMediaLists?.includes('financial_crime')),
          violent_crime: Boolean(amlCheck?.data.adverseMediaLists?.includes('violent_crime')),
          sexual_crime: Boolean(amlCheck?.data.adverseMediaLists?.includes('sexual_crime')),
          cyber_crime: Boolean(amlCheck?.data.adverseMediaLists?.includes('cyber_crime')),
          terrorism: Boolean(amlCheck?.data.adverseMediaLists?.includes('terrorism')),
          fraud: Boolean(amlCheck?.data.adverseMediaLists?.includes('fraud')),
          narcotics: Boolean(amlCheck?.data.adverseMediaLists?.includes('narcotics')),
          general_serious: Boolean(amlCheck?.data.adverseMediaLists?.includes('general_serious')),
          general_minor: Boolean(amlCheck?.data.adverseMediaLists?.includes('general_minor')),
        },
        hasOptionSelected: true,
        matchingMethod: getMatchingMethod(amlCheck?.data.matchKind),
      },
    };
  };

  return {
    step: 'name',
    data: {
      ...defaultFormValues,
      nameForm: {
        name: playbook.name,
      },
      templateForm: {
        template: getTemplate(playbook.cipKind),
      },
      residencyForm: {
        allowUsTerritories: playbook.allowUsTerritoryResidents,
        countryList: playbook.internationalCountryRestrictions ?? [],
        isCountryRestricted: Boolean(playbook.internationalCountryRestrictions?.length),
        residencyType: playbook.allowUsResidents ? 'us' : 'international',
      },
      detailsForm: {
        person: {
          address: playbook.mustCollectData.includes('full_address'),
          dob: playbook.mustCollectData.includes('dob'),
          email: true,
          phoneNumber: playbook.mustCollectData.includes('phone_number'),
          usLegalStatus: playbook.mustCollectData.includes('us_legal_status'),
          ssn: {
            collect:
              playbook.mustCollectData.includes('ssn4') ||
              playbook.mustCollectData.includes('ssn9') ||
              playbook.optionalData.includes('ssn4') ||
              playbook.optionalData.includes('ssn9'),
            kind: playbook.mustCollectData.includes('ssn4') || playbook.optionalData.includes('ssn4') ? 'ssn4' : 'ssn9',
            optional: playbook.optionalData.includes('ssn4') || playbook.optionalData.includes('ssn9'),
          },
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
        investor: {
          collect: playbook.mustCollectData.includes('investor_profile'),
        },
      },
      requiredAuthMethodsForm: {
        email: playbook.requiredAuthMethods?.includes('email') || false,
        phone: playbook.requiredAuthMethods?.includes('phone') || false,
      },
      verificationChecksForm: getVerificationChecks(playbook),
    },
  };
};
