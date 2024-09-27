import useEntityVault from '@/entities/hooks/use-entity-vault';
import { type DataIdentifier, type Entity, isVaultDataDecrypted, isVaultDataEmpty } from '@onefootprint/types';
import { BusinessDI, IdDI } from '@onefootprint/types';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

const useEditField = (entity: Entity) => {
  const { t } = useTranslation('common', { keyPrefix: 'di' });
  const { data: vaultData } = useEntityVault(entity.id, entity);

  const canEditField = (di: DataIdentifier) => {
    if (di === IdDI.ssn4) {
      // BE updates both ssn4 and ssn9 when ssn9 is changed and errors if only ssn4 is updated
      return !vaultData?.vault[IdDI.ssn9];
    }

    const editableFields: DataIdentifier[] = [
      IdDI.firstName,
      IdDI.middleName,
      IdDI.lastName,
      IdDI.dob,
      IdDI.ssn9,
      IdDI.addressLine1,
      IdDI.addressLine2,
      IdDI.city,
      IdDI.state,
      IdDI.country,
      IdDI.zip,
      IdDI.nationality,
      IdDI.usLegalStatus,
      IdDI.visaKind,
      IdDI.visaExpirationDate,
      IdDI.citizenships,
      BusinessDI.name,
      BusinessDI.doingBusinessAs,
      BusinessDI.website,
      BusinessDI.tin,
      BusinessDI.corporationType,
      BusinessDI.addressLine1,
      BusinessDI.addressLine2,
      BusinessDI.city,
      BusinessDI.state,
      BusinessDI.country,
      BusinessDI.zip,
      BusinessDI.formationState,
      BusinessDI.formationDate,
    ];
    return editableFields.includes(di);
  };

  const getProps = (di: DataIdentifier) => {
    const hasLegalStatus = !!vaultData?.vault[IdDI.usLegalStatus];
    const label =
      di === IdDI.nationality && hasLegalStatus ? t('id.country_of_birth') : (t(di as ParseKeys<'common'>) as string);
    const value = vaultData?.vault[di];

    return {
      label,
      value,
      transforms: vaultData?.transforms[di],
      isDecrypted: isVaultDataDecrypted(value),
      isEmpty: isVaultDataEmpty(value),
      canEdit: canEditField(di),
    };
  };

  return getProps;
};

export default useEditField;
