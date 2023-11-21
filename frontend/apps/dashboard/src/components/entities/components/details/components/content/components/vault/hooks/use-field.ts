import { useTranslation } from '@onefootprint/hooks';
import type { DataIdentifier, Entity } from '@onefootprint/types';
import {
  IdDI,
  isVaultDataDecrypted,
  isVaultDataEncrypted,
} from '@onefootprint/types';

import useEntityVault from '@/entities/hooks/use-entity-vault';

import {
  useDecryptControls,
  useEditControls,
} from '../components/vault-actions';

const useField = (entity: Entity) => {
  const { t } = useTranslation('di');
  const entityVault = useEntityVault(entity.id, entity);
  const decryptControls = useDecryptControls();
  const editControls = useEditControls();

  const showCheckbox = decryptControls.inProgress;

  const canDecryptField = (di: DataIdentifier) =>
    entity.decryptableAttributes.includes(di);

  const canSelect = (di: DataIdentifier) => {
    const value = entityVault.data?.[di];
    return canDecryptField(di) && isVaultDataEncrypted(value);
  };

  const canEditField = (di: DataIdentifier) => {
    if (di.startsWith('document')) {
      return false;
    }

    if (di.startsWith('id')) {
      const isLegalStatusRelated = [
        IdDI.usLegalStatus,
        IdDI.visaKind,
        IdDI.visaExpirationDate,
        IdDI.citizenships,
      ].includes(di as IdDI);
      return !isLegalStatusRelated;
    }

    return false;
  };

  const showEditView = editControls.inProgress;

  const getProps = (di: DataIdentifier) => {
    const value = entityVault.data?.[di];
    return {
      canDecrypt: canDecryptField(di),
      canSelect: canSelect(di),
      disabled: !canSelect(di),
      label: t(di),
      name: di,
      showCheckbox,
      value: entityVault.data?.[di],
      isDecrypted: isVaultDataDecrypted(value),
      canEditField: canEditField(di),
      showEditView,
    };
  };

  return getProps;
};

export default useField;
