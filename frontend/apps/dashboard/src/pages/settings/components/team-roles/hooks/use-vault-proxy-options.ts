import { useTranslation } from '@onefootprint/hooks';
import {
  InvokeVaultProxyRoleScope,
  RoleScope,
  RoleScopeKind,
} from '@onefootprint/types';

import useProxyConfigs from './use-proxy-configs';

// These aren't sent to the API - just used to represent all the options of decryptable things in
// the MultiSelect. We need this since different decrypt options have special serializations in the API
export enum VaultProxyOptionKind {
  all = 'any',
  jit = 'just_in_time',
}

export type VaultProxyOption = VaultProxyOptionKind | string;

export const vaultProxyOptionFromScope = (
  scope: RoleScope,
): VaultProxyOption | undefined => {
  if (scope.kind !== RoleScopeKind.invokeVaultProxy) {
    return undefined;
  }
  if (
    scope.data.kind === VaultProxyOptionKind.all ||
    scope.data.kind === VaultProxyOptionKind.jit
  ) {
    return scope.data.kind;
  }
  return scope.data.id;
};

export const scopeFromVaultProxyOption = (
  option: VaultProxyOption,
): InvokeVaultProxyRoleScope => {
  if (
    option === VaultProxyOptionKind.all ||
    option === VaultProxyOptionKind.jit
  ) {
    return { kind: RoleScopeKind.invokeVaultProxy, data: { kind: option } };
  }
  return {
    kind: RoleScopeKind.invokeVaultProxy,
    data: { kind: 'id', id: option },
  };
};

export type Option = {
  label: string;
  value: string;
};

const useVaultProxyOptions = () => {
  const { t } = useTranslation('pages.settings.roles.scopes');
  // TODO we'll get rid of this overriding of is-live once IAM roles are environment-specific
  const { data: liveData } = useProxyConfigs(true, {
    status: 'enabled',
  });
  const { data: sandboxData } = useProxyConfigs(false, { status: 'enabled' });

  const allData = sandboxData.concat(liveData);
  const vaultProxyOptions: Option[] = allData.map(c => ({
    value: c.id,
    label: c.name,
  }));
  const options: Option[] = [
    {
      value: VaultProxyOptionKind.jit as VaultProxyOption,
      label: t('invoke_vault_proxy_options.jit'),
    },
  ].concat(vaultProxyOptions);
  const allOption: Option = {
    value: VaultProxyOptionKind.all,
    label: t('invoke_vault_proxy_options.all'),
  };
  const allOptions = options.concat([allOption]);
  return { options, allOption, allOptions };
};

export default useVaultProxyOptions;
