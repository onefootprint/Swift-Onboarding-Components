import { getLogger } from '@onefootprint/idv';
import { CardDIField } from '@onefootprint/types';

import type { FormSection } from '../../components/form-base';
import getCardDiField from '../get-card-di-field';

const { logError } = getLogger();

const SectionsByFields: Partial<Record<FormSection, CardDIField[]>> = {
  name: [CardDIField.name],
  card: [CardDIField.number, CardDIField.expiration, CardDIField.cvc],
  partialAddress: [CardDIField.zip, CardDIField.country],
};

const getFormSectionsFromFields = (vaultFields?: string[]): FormSection[] => {
  if (!vaultFields?.length) {
    logError("The auth token doesn't have permissions to collect any fields.");
    return [];
  }

  const vaultFieldNames = vaultFields.map(field => getCardDiField(field)).filter(field => field) as CardDIField[];

  const sections: FormSection[] = [];
  Object.keys(SectionsByFields).forEach(key => {
    const section = key as FormSection;
    const fields = SectionsByFields[section];
    const isSectionInVault = fields?.every(field => vaultFieldNames.includes(field));
    if (isSectionInVault) {
      sections.push(section);
    }
  });

  return sections;
};

export default getFormSectionsFromFields;
