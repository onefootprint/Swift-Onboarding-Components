import { OnboardingConfigKind, type OrgOnboardingConfigCreateRequest } from '@onefootprint/types';
import { createAdditionalDocsPayload } from '../../../utils/create-payload';
import type { NameFormData } from '../../step-name';
import type { DocumentsDetailsFormData } from '../components/step-document-details';

const createPayload = (formData: NameFormData & DocumentsDetailsFormData): OrgOnboardingConfigCreateRequest => {
  return {
    name: formData.name,
    kind: OnboardingConfigKind.document,
    canAccessData: [],
    mustCollectData: [],
    documentTypesAndCountries: {
      countrySpecific: formData.gov.country,
      global: formData.gov.global,
    },
    ...createAdditionalDocsPayload(formData.docs),
    skipKyc: true,
  };
};

export default createPayload;
