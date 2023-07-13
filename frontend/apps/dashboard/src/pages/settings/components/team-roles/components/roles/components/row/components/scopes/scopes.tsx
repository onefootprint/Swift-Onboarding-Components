import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { RoleScope } from '@onefootprint/types';
import { Tag } from '@onefootprint/ui';
import React from 'react';

import groupScopes from '../../../../../../utils/group-scopes';
import DecryptOptions from '../../../../../decrypt-options';
import VaultProxyOptions from '../../../../../vault-proxy-options';

export type ScopesProps = {
  scopes: RoleScope[];
};

const Scopes = ({ scopes }: ScopesProps) => {
  const { t } = useTranslation('pages.settings.roles');
  const { isAdmin, decryptOptions, basicScopes, vaultProxyOptions } =
    groupScopes(scopes);

  if (isAdmin) {
    return <span>{t('scopes.admin')}</span>;
  }

  return (
    <Tags>
      {basicScopes.map(scope => (
        <Tag key={scope.kind}>{t(`scopes.${scope.kind}`)}</Tag>
      ))}
      <DecryptOptions options={decryptOptions} as={Tag} />
      <VaultProxyOptions options={vaultProxyOptions} as={Tag} />
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
