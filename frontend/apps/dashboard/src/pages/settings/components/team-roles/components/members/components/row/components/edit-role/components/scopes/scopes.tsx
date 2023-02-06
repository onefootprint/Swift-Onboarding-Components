import { useTranslation } from '@onefootprint/hooks';
import { OrgRoleScope } from '@onefootprint/types';
import { Tooltip } from '@onefootprint/ui';
import React from 'react';

const groupScopes = (scopes: OrgRoleScope[]) => {
  const decryptScopes = scopes.filter((scope: OrgRoleScope) =>
    scope.startsWith('decrypt'),
  );
  const nonDecryptScopes = scopes.filter(
    (scope: OrgRoleScope) => !scope.startsWith('decrypt'),
  );
  const isAdmin = scopes.includes('admin');
  return { isAdmin, decryptScopes, nonDecryptScopes };
};

export type ScopesListProps = {
  scopes: OrgRoleScope[];
};

const ScopesList = ({ scopes }: ScopesListProps) => {
  const { t } = useTranslation('pages.settings.roles');
  const { isAdmin, decryptScopes, nonDecryptScopes } = groupScopes(scopes);

  return isAdmin ? (
    <span>{t('scopes.admin')}</span>
  ) : (
    <>
      {nonDecryptScopes.map(scope => (
        <span key={scope}>{t(`scopes.${scope}`)}</span>
      ))}
      {decryptScopes.length === 1 && (
        <span>
          {t(`scopes.decrypt_fields`, {
            count: 1,
            field: t(`scopes.${decryptScopes[0]}`),
          })}
        </span>
      )}
      {decryptScopes.length > 1 && (
        <Tooltip
          text={decryptScopes.map(scope => t(`scopes.${scope}`)).join(', ')}
        >
          <span>
            {t(`scopes.decrypt_fields`, {
              count: decryptScopes.length,
            })}
          </span>
        </Tooltip>
      )}
    </>
  );
};

export default ScopesList;
