import { useTranslation } from '@onefootprint/hooks';
import { RoleScope } from '@onefootprint/types';
import { Tag, Tooltip } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import groupScopes from './utils/group-scopes';

export type ScopesProps = {
  scopes: RoleScope[];
};

const Scopes = ({ scopes }: ScopesProps) => {
  const { t } = useTranslation('pages.settings.roles');
  const { isAdmin, decryptScopes, nonDecryptScopes } = groupScopes(scopes);

  if (isAdmin) {
    return <span>{t('scopes.admin')}</span>;
  }

  return (
    <Tags>
      {nonDecryptScopes.map(scope => (
        <Tag key={scope}>{t(`scopes.${scope}`)}</Tag>
      ))}
      {decryptScopes.length === 1 && (
        <Tag>
          {t(`scopes.decrypt_fields`, {
            count: 1,
            field: t(`scopes.${decryptScopes[0]}`),
          })}
        </Tag>
      )}
      {decryptScopes.length > 1 && (
        <Tooltip
          text={decryptScopes.map(scope => t(`scopes.${scope}`)).join(', ')}
        >
          <Tag>
            {t(`scopes.decrypt_fields`, {
              count: decryptScopes.length,
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
