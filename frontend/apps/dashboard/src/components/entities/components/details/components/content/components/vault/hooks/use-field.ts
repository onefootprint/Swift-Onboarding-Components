import type { DataIdentifier, Entity } from '@onefootprint/types';
import { BusinessDI, IdDI, isVaultDataDecrypted, isVaultDataEncrypted } from '@onefootprint/types';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import useEntityVault from '@/entities/hooks/use-entity-vault';

import { useDecryptControls, useEditControls } from '../components/vault-actions';

const useField = (entity: Entity) => {
  const { t } = useTranslation('common', { keyPrefix: 'di' });
  const entityVaultWithTransforms = useEntityVault(entity.id, entity);

  const decryptControls = useDecryptControls();
  const editControls = useEditControls();

  const showCheckbox = decryptControls.inProgress;

  const canDecryptField = (di: DataIdentifier) => entity.decryptableAttributes.includes(di);

  const canSelect = (di: DataIdentifier) => {
    const value = entityVaultWithTransforms.data?.vault[di];
    return canDecryptField(di) && isVaultDataEncrypted(value);
  };

  const canEditField = (di: DataIdentifier) => {
    const uneditableFields: DataIdentifier[] = [
      IdDI.email,
      IdDI.phoneNumber,
      BusinessDI.phoneNumber,
      BusinessDI.beneficialOwners,
      BusinessDI.kycedBeneficialOwners,
    ];
    if (uneditableFields.includes(di)) {
      return false;
    }
    // temporary!
    if (di in BusinessDI) {
      return false;
    }
    // BE updates both ssn4 and ssn9 when ssn9 is changed and errors if only ssn4 is updated
    if (di === IdDI.ssn4) {
      return !entityVaultWithTransforms.data?.vault[IdDI.ssn9];
    }
    return di.startsWith('id') || di.startsWith('business');
  };

  const showEditView = editControls.inProgress;

  const getProps = (di: DataIdentifier) => {
    const value = entityVaultWithTransforms.data?.vault[di];
    const transforms = entityVaultWithTransforms.data?.transforms[di];
    return {
      canDecrypt: canDecryptField(di),
      canSelect: canSelect(di),
      disabled: !canSelect(di),
      label: t(di as ParseKeys<'common'>) as string,
      name: di,
      showCheckbox,
      value,
      transforms,
      isDecrypted: isVaultDataDecrypted(value),
      canEdit: canEditField(di),
      showEditView,
    };
  };

  return getProps;
};

export default useField;
