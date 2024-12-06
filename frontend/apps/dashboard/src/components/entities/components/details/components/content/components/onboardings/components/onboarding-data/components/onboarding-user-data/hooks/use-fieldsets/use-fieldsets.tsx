import type { DataIdentifier } from '@onefootprint/request-types/dashboard';
import { IdDI } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

export type FieldsetField = { di: DataIdentifier }; // TODO: add customRender property to FieldsetField
export type Fieldset = Record<string, { fields: FieldsetField[]; title: string }>;

const useFieldsets = (includeNationality?: boolean): Fieldset => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.user.vault' });

  const fieldsets = {
    basic: {
      title: t('basic.title'),
      fields: [
        { di: IdDI.firstName },
        { di: IdDI.middleName },
        { di: IdDI.lastName },
        { di: IdDI.email },
        { di: IdDI.phoneNumber },
      ],
    },
    address: {
      title: t('address.title'),
      fields: [
        { di: IdDI.country },
        { di: IdDI.addressLine1 },
        { di: IdDI.addressLine2 },
        { di: IdDI.city },
        { di: IdDI.zip },
        { di: IdDI.state },
      ],
    },
    identity: {
      title: t('identity.title'),
      fields: [{ di: IdDI.ssn9 }, { di: IdDI.ssn4 }, { di: IdDI.dob }],
    },
    usLegalStatus: {
      title: t('us-legal-status.title'),
      fields: [
        { di: IdDI.usLegalStatus },
        { di: IdDI.nationality },
        { di: IdDI.citizenships },
        { di: IdDI.visaKind },
        { di: IdDI.visaExpirationDate },
      ],
    },
    custom: {
      title: t('custom.title'),
      fields: [],
    },
  };
  if (includeNationality) {
    fieldsets.identity.fields.push({ di: IdDI.nationality });
  }
  return fieldsets;
};

export default useFieldsets;
