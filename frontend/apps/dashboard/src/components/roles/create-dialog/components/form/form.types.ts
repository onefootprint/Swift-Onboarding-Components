import { BasicRoleScopeKind } from '@onefootprint/types';
import { DecryptOption, VaultProxyOption } from 'src/components/roles';

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
