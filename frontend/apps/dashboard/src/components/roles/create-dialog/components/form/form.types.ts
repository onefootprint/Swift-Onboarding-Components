import type { BasicRoleScopeKind } from '@onefootprint/types';
import type { DecryptOption, VaultProxyOption } from 'src/components/roles';

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
