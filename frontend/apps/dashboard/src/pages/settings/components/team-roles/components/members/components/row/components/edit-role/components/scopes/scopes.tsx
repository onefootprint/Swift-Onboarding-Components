import { useTranslation } from '@onefootprint/hooks';
import { RoleScope } from '@onefootprint/types';
import { Tooltip } from '@onefootprint/ui';
import React from 'react';
import groupScopes from 'src/pages/settings/components/team-roles/components/roles/components/row/components/scopes/utils/group-scopes';

export type ScopesListProps = {
  scopes: RoleScope[];
};

const ScopesList = ({ scopes }: ScopesListProps) => {
  const { t } = useTranslation('pages.settings.roles');
  const { isAdmin, decryptOptions, nonDecryptScopes } = groupScopes(scopes);

  return isAdmin ? (
    <span>{t('scopes.admin')}</span>
  ) : (
    <>
      {nonDecryptScopes.map(scope => (
        <span key={scope.kind}>{t(`scopes.${scope.kind}`)}</span>
      ))}
      {decryptOptions.length === 1 && (
        <span>
          {t(`scopes.decrypt_fields_one`, {
            count: 1,
            field: t(`scopes.decrypt.${decryptOptions[0]}`),
          })}
        </span>
      )}
      {decryptOptions.length > 1 && (
        <Tooltip
          text={decryptOptions
            .map(scope => t(`scopes.decrypt.${scope}`))
            .join(', ')}
        >
          <span>
            {t(`scopes.decrypt_fields_other`, {
              count: decryptOptions.length,
            })}
          </span>
        </Tooltip>
      )}
    </>
  );
};

export default ScopesList;
