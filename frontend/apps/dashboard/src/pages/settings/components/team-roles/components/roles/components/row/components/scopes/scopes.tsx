import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { RoleScope } from '@onefootprint/types';
import { Tag, Tooltip } from '@onefootprint/ui';
import React from 'react';

import groupScopes from './utils/group-scopes';

export type ScopesProps = {
  scopes: RoleScope[];
};

const Scopes = ({ scopes }: ScopesProps) => {
  const { t } = useTranslation('pages.settings.roles');
  const { isAdmin, decryptOptions, nonDecryptScopes } = groupScopes(scopes);

  if (isAdmin) {
    return <span>{t('scopes.admin')}</span>;
  }

  return (
    <Tags>
      {nonDecryptScopes.map(scope => (
        <Tag key={scope.kind}>{t(`scopes.${scope.kind}`)}</Tag>
      ))}
      {decryptOptions.length === 1 && (
        <Tag>
          {t(`scopes.decrypt_fields_one`, {
            count: 1,
            field: t(`scopes.decrypt.${decryptOptions[0]}`),
          })}
        </Tag>
      )}
      {decryptOptions.length > 1 && (
        <Tooltip
          text={decryptOptions
            .map(scope => t(`scopes.decrypt.${scope}`))
            .join(', ')}
        >
          <Tag>
            {t(`scopes.decrypt_fields_other`, {
              count: decryptOptions.length,
            })}
          </Tag>
        </Tooltip>
      )}
    </Tags>
  );
};

const Tags = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[3]} 0;
  `}
`;

export default Scopes;
