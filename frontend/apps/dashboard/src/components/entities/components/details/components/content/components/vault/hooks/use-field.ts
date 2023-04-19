import { useTranslation } from '@onefootprint/hooks';
import {
  CdoToDiMap,
  CollectedDataOption,
  DataIdentifier,
  Entity,
  isVaultDataDecrypted,
  isVaultDataEncrypted,
  RoleScope,
} from '@onefootprint/types';
import usePermissions from 'src/hooks/use-permissions';

import useEntityVault from '@/entities/hooks/use-entity-vault';

import { useDecryptControls } from '../components/decrypt-controls';

const canScopesDecrypt = (scopes: RoleScope[], di: DataIdentifier) => {
  if (scopes.includes(RoleScope.admin)) {
    return true;
  }
  // See if any scope grants permissions to decrypt the DI
  return scopes.some(s => {
    // Decrypt permissions always have a CDO after the dot
    const cdo = s.split('decrypt.')[1];
    if (!cdo) {
      return false;
    }
    return CdoToDiMap[cdo as CollectedDataOption].includes(di);
  });
};

const useField = (entity: Entity) => {
  const { t } = useTranslation('di');
  const { scopes } = usePermissions();
  const entityVault = useEntityVault(entity.id, entity);
  const decryptControls = useDecryptControls();
  const showCheckbox = decryptControls.inProgress;

  const canDecryptField = (di: DataIdentifier) => {
    // In order to be able to decrypt a given DI, it must be
    // (1) decryptable by the tenant, represented by canAccessPermissions on an approved onboarding AND
    // (2) decryptable by the authed user, represented by the scopes for the authed user
    const canTenantDecrypt = canScopesDecrypt(
      entity.onboarding?.canAccessPermissions || [],
      di,
    );
    const canUserDecrypt = canScopesDecrypt(scopes, di);
    return canTenantDecrypt && canUserDecrypt;
  };

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
