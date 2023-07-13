import { BasicRoleScopeKind } from '@onefootprint/types';

import { DecryptOption } from '../../../../hooks/use-decrypt-options';
import { VaultProxyOption } from '../../../../hooks/use-vault-proxy-options';

export type VaultProxySelectOption = {
  label: string;
  value: VaultProxyOption;
};

export type FormData = {
  decryptOptions: { label: string; value: DecryptOption }[];
  vaultProxyConfigs: VaultProxySelectOption[];
  name: string;
  scopeKinds: BasicRoleScopeKind[];
  showDecrypt: boolean;
  showProxyConfigs: boolean;
};
