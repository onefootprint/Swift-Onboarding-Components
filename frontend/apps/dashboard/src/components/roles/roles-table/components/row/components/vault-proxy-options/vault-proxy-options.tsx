import type { ParseKeys } from 'i18next';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import type { VaultProxyOption } from '../../../../../hooks/use-vault-proxy-options';
import { VaultProxyOptionKind } from '../../../../../hooks/use-vault-proxy-options';

export type VaultProxyOptionProps<T extends React.ElementType> = {
  options: VaultProxyOption[];
  as?: T;
};

const VaultProxyOptions = <T extends React.ElementType>({ options, as }: VaultProxyOptionProps<T>) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.settings.roles' });
  const Component = as || 'span';
  if (options.length === 1) {
    if (options[0] === VaultProxyOptionKind.all) {
      return <Component>{t('scopes.invoke_vault_proxy.all' as ParseKeys<'common'>) as unknown as string}</Component>;
    }
    if (options[0] === VaultProxyOptionKind.jit) {
      return <Component>{t('scopes.invoke_vault_proxy.jit' as ParseKeys<'common'>) as unknown as string}</Component>;
    }
    return <Component>{t('scopes.invoke_vault_proxy.one' as ParseKeys<'common'>) as unknown as string}</Component>;
  }
  if (options.length > 1) {
    return (
      <Component>
        {t('scopes.invoke_vault_proxy.other', {
          count: options.length,
        })}
      </Component>
    );
  }
  return null;
};

export default VaultProxyOptions;
