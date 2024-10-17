import {
  AuthMethodKind,
  type CustomDI,
  type DocumentRequestConfig,
  DocumentRequestKind,
  type DocumentTypesAndCountries,
} from '@onefootprint/types';
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
      kind: DocumentRequestKind.ProofOfAddress,
      data: {
        requiresHumanReview: !!requireManualReview,
      },
    });
  }
  if (possn) {
    documentsToCollect.push({
      kind: DocumentRequestKind.ProofOfSsn,
      data: {
        requiresHumanReview: !!requireManualReview,
      },
    });
  }
  if (custom) {
    custom.forEach(doc => {
      documentsToCollect.push({
        kind: DocumentRequestKind.Custom,
        data: {
          description: doc.description,
          identifier: `document.custom.${doc.identifier}` as CustomDI,
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
    requiredAuthMethods.push(AuthMethodKind.email);
  }
  if (formData.phone) {
    requiredAuthMethods.push(AuthMethodKind.phone);
  }
  return requiredAuthMethods;
};

export const createGovDocsPayload = (formData: GovDocsFormData['gov']): DocumentTypesAndCountries | null => {
  if (formData.global.length === 0 && Object.keys(formData.country).length === 0) {
    return null;
  }
  return {
    countrySpecific: formData.country,
    global: formData.global,
  };
};
