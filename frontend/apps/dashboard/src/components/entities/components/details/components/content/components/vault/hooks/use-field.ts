import { useTranslation } from '@onefootprint/hooks';
import {
  DataIdentifier,
  Entity,
  isVaultDataDecrypted,
  isVaultDataEncrypted,
} from '@onefootprint/types';

import useEntityVault from '@/entities/hooks/use-entity-vault';

import { useDecryptControls } from '../components/vault-actions';

const useField = (entity: Entity) => {
  const { t } = useTranslation('di');
  const entityVault = useEntityVault(entity.id, entity);
  const decryptControls = useDecryptControls();
  const showCheckbox = decryptControls.inProgress;

  const canDecryptField = (di: DataIdentifier) =>
    entity.decryptableAttributes.includes(di);

  const canSelect = (di: DataIdentifier) => {
    const value = entityVault.data?.[di];
    return canDecryptField(di) && isVaultDataEncrypted(value);
  };

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
    };
  };

  return getProps;
};

export default useField;
