import { useTranslation } from '@onefootprint/hooks';
import React from 'react';

import {
  VaultProxyOption,
  VaultProxyOptionKind,
} from '../../hooks/use-vault-proxy-options';

export type VaultProxyOptionProps<T extends React.ElementType> = {
  options: VaultProxyOption[];
  as?: T;
};

const VaultProxyOptions = <T extends React.ElementType>({
  options,
  as,
}: VaultProxyOptionProps<T>) => {
  const { t } = useTranslation('pages.settings.roles');
  const Component = as || 'span';
  if (options.length === 1) {
    if (options[0] === VaultProxyOptionKind.all) {
      return <Component>{t(`scopes.invoke_vault_proxy.all`)}</Component>;
    }
    if (options[0] === VaultProxyOptionKind.jit) {
      return <Component>{t(`scopes.invoke_vault_proxy.jit`)}</Component>;
    }
    return <Component>{t(`scopes.invoke_vault_proxy.one`)}</Component>;
  }
  if (options.length > 1) {
    return (
      <Component>
        {t(`scopes.invoke_vault_proxy.other`, {
          count: options.length,
        })}
      </Component>
    );
  }
  return null;
};

export default VaultProxyOptions;
