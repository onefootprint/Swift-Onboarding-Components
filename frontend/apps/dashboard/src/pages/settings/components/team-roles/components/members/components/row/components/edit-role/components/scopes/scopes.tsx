import { useTranslation } from '@onefootprint/hooks';
import { RoleScope } from '@onefootprint/types';
import React from 'react';
import DecryptOptions from 'src/components/roles/roles-table/components/row/components/decrypt-options';
import VaultProxyOptions from 'src/components/roles/roles-table/components/row/components/vault-proxy-options';
import groupScopes from 'src/components/roles/utils/group-scopes';

export type ScopesListProps = {
  scopes: RoleScope[];
};

const ScopesList = ({ scopes }: ScopesListProps) => {
  const { t } = useTranslation('pages.settings.roles');
  const { isAdmin, decryptOptions, basicScopes, vaultProxyOptions } =
    groupScopes(scopes);

  return isAdmin ? (
    <span>{t('scopes.admin')}</span>
  ) : (
    <>
      {basicScopes.map(scope => (
        <span key={scope.kind}>{t(`scopes.${scope.kind}`)}</span>
      ))}
      <DecryptOptions options={decryptOptions} />
      <VaultProxyOptions options={vaultProxyOptions} />
    </>
  );
};

export default ScopesList;
