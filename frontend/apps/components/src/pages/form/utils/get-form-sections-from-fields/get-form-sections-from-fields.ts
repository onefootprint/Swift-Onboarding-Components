import { CardDIField } from '@onefootprint/types';

import type { FormSection } from '../../components/form-base';

const SectionsByFields: Partial<Record<FormSection, CardDIField[]>> = {
  name: [CardDIField.name],
  card: [CardDIField.number, CardDIField.expiration, CardDIField.cvc],
  partialAddress: [CardDIField.zip, CardDIField.country],
};

const getCardDIField = (di: string): CardDIField | null => {
  try {
    const [, , ...field] = di.split('.');
    return field.join('.') as CardDIField;
  } catch (e) {
    return null;
  }
};

const getFormSectionsFromFields = (vaultFields?: string[]): FormSection[] => {
  if (!vaultFields?.length) {
    console.error(
      "The auth token doesn't have permissions to collect any fields.",
    );
    return [];
  }

  const vaultFieldNames = vaultFields
    .map(field => getCardDIField(field))
    .filter(field => field) as CardDIField[];

  const sections: FormSection[] = [];
  Object.keys(SectionsByFields).forEach(key => {
    const section = key as FormSection;
    const fields = SectionsByFields[section];
    const isSectionInVault =
      fields && fields.every(field => vaultFieldNames.includes(field));
    if (isSectionInVault) {
      sections.push(section);
    }
  });

  return sections;
};

export default getFormSectionsFromFields;
