import type { TenantScope } from '@onefootprint/request-types/dashboard';
import type { DecryptOption, VaultProxyOption } from 'src/components/roles';

export type VaultProxySelectOption = {
  label: string;
  value: VaultProxyOption;
};

export type FormData = {
  decryptOptions: { label: string; value: DecryptOption }[];
  vaultProxyConfigs: VaultProxySelectOption[];
  name: string;
  scopeKinds: TenantScope[];
  showDecrypt: boolean;
  showProxyConfigs: boolean;
};
