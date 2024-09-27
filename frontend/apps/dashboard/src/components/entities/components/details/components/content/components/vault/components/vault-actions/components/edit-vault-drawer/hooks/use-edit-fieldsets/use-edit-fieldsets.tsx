import { IcoBuilding16, IcoFileText16, IcoGlobe16, IcoUsers16, type Icon } from '@onefootprint/icons';
import { type DataIdentifier, EntityKind } from '@onefootprint/types';
import { BusinessDI, IdDI } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

export type EditFieldset = Record<string, { fields: DataIdentifier[]; iconComponent: Icon; title: string }>;

const useEditFieldsets = (entityKind: EntityKind, includeNationality?: boolean): EditFieldset => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.user.vault' });

  if (entityKind === EntityKind.person) {
    const personVaultFieldsets = {
      basic: {
        title: t('basic.title'),
        iconComponent: IcoFileText16,
        fields: [IdDI.firstName, IdDI.middleName, IdDI.lastName, IdDI.email, IdDI.phoneNumber],
      },
      address: {
        title: t('address.title'),
        iconComponent: IcoBuilding16,
        fields: [IdDI.country, IdDI.addressLine1, IdDI.addressLine2, IdDI.city, IdDI.zip, IdDI.state],
      },
      identity: {
        title: t('identity.title'),
        iconComponent: IcoUsers16,
        fields: [IdDI.ssn9, IdDI.ssn4, IdDI.dob],
      },
      usLegalStatus: {
        title: t('us-legal-status.title'),
        iconComponent: IcoGlobe16,
        fields: [IdDI.usLegalStatus, IdDI.nationality, IdDI.citizenships, IdDI.visaKind, IdDI.visaExpirationDate],
      },
    };
    if (includeNationality) {
      personVaultFieldsets.identity.fields.push(IdDI.nationality);
    }
    return personVaultFieldsets;
  }

  if (entityKind === EntityKind.business) {
    return {
      basic: {
        title: t('basic.title'),
        iconComponent: IcoFileText16,
        fields: [
          BusinessDI.name,
          BusinessDI.doingBusinessAs,
          BusinessDI.tin,
          BusinessDI.corporationType,
          BusinessDI.website,
          BusinessDI.phoneNumber,
          BusinessDI.formationState,
          BusinessDI.formationDate,
        ],
      },
      address: {
        title: t('address.title'),
        iconComponent: IcoUsers16,
        fields: [
          BusinessDI.country,
          BusinessDI.addressLine1,
          BusinessDI.addressLine2,
          BusinessDI.city,
          BusinessDI.zip,
          BusinessDI.state,
        ],
      },
    };
  }

  return {};
};

export default useEditFieldsets;
