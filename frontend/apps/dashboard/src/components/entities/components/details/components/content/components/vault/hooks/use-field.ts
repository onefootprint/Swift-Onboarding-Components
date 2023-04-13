import { useTranslation } from '@onefootprint/hooks';
import {
  DataIdentifier,
  Entity,
  isVaultDataDecrypted,
  isVaultDataEncrypted,
} from '@onefootprint/types';
import usePermissions from 'src/hooks/use-permissions';

import useEntityVault from '@/entities/hooks/use-entity-vault';

import { useDecryptControls } from '../components/decrypt-controls';

const useField = (entity: Entity) => {
  const { t } = useTranslation('di');
  const { isAdmin, scopes } = usePermissions();
  const entityVault = useEntityVault(entity.id, entity);
  const decryptControls = useDecryptControls();
  const showCheckbox = decryptControls.inProgress;

  const canDecrypt = (di: DataIdentifier) => {
    const canAccess = !!entity.onboarding?.canAccessAttributes.includes(di);
    const hasDecryptRole = scopes.some(scope =>
      entity.onboarding?.canAccessPermissions.includes(scope),
    );
    return canAccess && (isAdmin || hasDecryptRole);
  };

  const canSelect = (di: DataIdentifier) => {
    const value = entityVault.data?.[di];
    return canDecrypt(di) && isVaultDataEncrypted(value);
  };

  const getProps = (di: DataIdentifier) => {
    const value = entityVault.data?.[di];
    return {
      canDecrypt: canDecrypt(di),
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
