import type { DataIdentifier, Entity } from '@onefootprint/types';
import { isVaultDataDecrypted, isVaultDataEmpty, isVaultDataEncrypted } from '@onefootprint/types';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import useEntityVault from '@/entities/hooks/use-entity-vault';

import { useDecryptControls } from '../components/vault-actions';

const useField = (entity: Entity) => {
  const { t } = useTranslation('common', { keyPrefix: 'di' });
  const entityVaultWithTransforms = useEntityVault(entity.id, entity);

  const decryptControls = useDecryptControls();

  const showCheckbox = decryptControls.inProgress;

  const canDecryptField = (di: DataIdentifier) => entity.decryptableAttributes.includes(di);

  const canSelect = (di: DataIdentifier) => {
    const value = entityVaultWithTransforms.data?.vault[di];
    return canDecryptField(di) && isVaultDataEncrypted(value);
  };

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
      isEmpty: isVaultDataEmpty(value),
    };
  };

  return getProps;
};

export default useField;
