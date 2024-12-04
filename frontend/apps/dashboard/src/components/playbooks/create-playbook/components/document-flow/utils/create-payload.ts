import type { CreateOnboardingConfigurationRequest } from '@onefootprint/request-types/dashboard';
import { createAdditionalDocsPayload, createGovDocsPayload } from '../../../utils/create-payload';
import type { DocumentsDetailsFormData } from '../components/step-document-details';
import type { StateFormData } from './reducer';

const createPayload = ({ nameForm, detailsForm }: StateFormData): CreateOnboardingConfigurationRequest => {
  const createIdDocOnlyMustCollectDataPayload = (data: DocumentsDetailsFormData) => {
    const { global = [], country, selfie } = data.gov;
    const hasIdDocuments = global.length > 0 || Object.keys(country).length > 0;
    if (hasIdDocuments) {
      return [selfie ? 'document_and_selfie' : 'document'];
    }
    return [];
  };

  return {
    name: nameForm.name,
    kind: 'document',
    verificationChecks: [],
    // @ts-expect-error: document_and_selfie and document are deprecated
    mustCollectData: createIdDocOnlyMustCollectDataPayload(detailsForm),
    documentTypesAndCountries: createGovDocsPayload(detailsForm.gov),
    documentsToCollect: createAdditionalDocsPayload(detailsForm.docs),
  };
};

export default createPayload;
