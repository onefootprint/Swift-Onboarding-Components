import type { CreateOnboardingConfigurationRequest } from '@onefootprint/request-types/dashboard';
import { createAdditionalDocsPayload, createGovDocsPayload } from '../../../utils/create-payload';
import type { NameFormData } from '../../name-step';
import type { DocumentsDetailsFormData } from '../components/step-document-details';

const createPayload = (formData: NameFormData & DocumentsDetailsFormData): CreateOnboardingConfigurationRequest => {
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
    kind: 'document',
    verificationChecks: [],
    // @ts-expect-error: document_and_selfie and document are deprecated
    mustCollectData: createIdDocOnlyMustCollectDataPayload(formData),
    documentTypesAndCountries: createGovDocsPayload(formData.gov),
    documentsToCollect: createAdditionalDocsPayload(formData.docs),
  };
};

export default createPayload;
