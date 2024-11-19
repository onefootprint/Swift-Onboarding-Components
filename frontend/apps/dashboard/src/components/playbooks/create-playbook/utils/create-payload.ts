import type {
  AuthMethodKind,
  DocumentAndCountryConfiguration,
  DocumentRequestConfig,
} from '@onefootprint/request-types/dashboard';
import type { AdditionalDocsFormData } from '../components/additional-docs';
import type { GovDocsFormData } from '../components/gov-docs';
import type { RequiredAuthMethodsFormData } from '../components/required-auth-methods-step';

export const createAdditionalDocsPayload = ({
  poa,
  possn,
  custom,
  requireManualReview,
}: AdditionalDocsFormData['docs']) => {
  const documentsToCollect: DocumentRequestConfig[] = [];
  if (poa) {
    documentsToCollect.push({
      kind: 'proof_of_address',
      data: {
        requiresHumanReview: !!requireManualReview,
      },
    });
  }
  if (possn) {
    documentsToCollect.push({
      kind: 'proof_of_ssn',
      data: {
        requiresHumanReview: !!requireManualReview,
      },
    });
  }
  if (custom) {
    custom.forEach(doc => {
      documentsToCollect.push({
        kind: 'custom',
        data: {
          description: doc.description,
          // @ts-expect-error: backend doesn't have the correct type
          identifier: `document.custom.${doc.identifier}`,
          name: doc.name,
          requiresHumanReview: !!requireManualReview,
          uploadSettings: doc.uploadSettings,
        },
      });
    });
  }
  return documentsToCollect;
};

export const createRequiredAuthMethodsPayload = (formData: RequiredAuthMethodsFormData) => {
  const requiredAuthMethods: AuthMethodKind[] = [];
  if (formData.email) {
    requiredAuthMethods.push('email');
  }
  if (formData.phone) {
    requiredAuthMethods.push('phone');
  }
  return requiredAuthMethods;
};

export const createGovDocsPayload = (formData: GovDocsFormData['gov']): DocumentAndCountryConfiguration | undefined => {
  if (formData.global.length === 0 && Object.keys(formData.country).length === 0) {
    return undefined;
  }
  return {
    countrySpecific: formData.country,
    global: formData.global,
  };
};
