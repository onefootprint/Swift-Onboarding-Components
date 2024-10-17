import { OnboardingConfigKind, type OrgOnboardingConfigCreateRequest } from '@onefootprint/types';
import { createAdditionalDocsPayload, createGovDocsPayload } from '../../../utils/create-payload';
import type { NameFormData } from '../../name-step';
import type { DocumentsDetailsFormData } from '../components/step-document-details';

const createPayload = (formData: NameFormData & DocumentsDetailsFormData): OrgOnboardingConfigCreateRequest => {
  const createIdDocOnlyMustCollectDataPayload = (data: DocumentsDetailsFormData) => {
    const { global = [], country, selfie } = data.gov;
    const hasIdDocuments = global.length > 0 || Object.keys(country).length > 0;
    if (hasIdDocuments) {
      return [selfie ? 'document_and_selfie' : 'document'];
    }
    return [];
  };

  return {
    name: formData.name,
    kind: OnboardingConfigKind.document,
    verificationChecks: [],
    canAccessData: createIdDocOnlyMustCollectDataPayload(formData),
    mustCollectData: createIdDocOnlyMustCollectDataPayload(formData),
    documentTypesAndCountries: createGovDocsPayload(formData.gov),
    documentsToCollect: createAdditionalDocsPayload(formData.docs),
  };
};

export default createPayload;
