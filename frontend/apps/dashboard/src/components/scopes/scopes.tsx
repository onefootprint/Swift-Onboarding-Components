import type { RoleScope } from '@onefootprint/types';
import { Tag } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import DecryptOptions from 'src/components/roles/roles-table/components/row/components/decrypt-options';
import VaultProxyOptions from 'src/components/roles/roles-table/components/row/components/vault-proxy-options';
import groupScopes from 'src/components/roles/utils/group-scopes';

export type ScopesListProps = {
  scopes: RoleScope[];
};

const ScopesList = ({ scopes }: ScopesListProps) => {
  const { t } = useTranslation('roles');
  const { isAdmin, decryptOptions, basicScopes, vaultProxyOptions } = groupScopes(scopes);

  if (isAdmin) {
    return <span>{t('scopes.admin')}</span>;
  }

  return (
    <>
      {basicScopes.map(scope => (
        <Tag key={scope.kind}>{t(`scopes.${scope.kind}` as unknown as ParseKeys<'common'>) as unknown as string}</Tag>
      ))}
      <DecryptOptions options={decryptOptions} />
      <VaultProxyOptions options={vaultProxyOptions} />
    </>
  );
};

export default ScopesList;
