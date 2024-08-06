import type { RoleScope } from '@onefootprint/types';
import { Tag } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import groupScopes from 'src/components/roles/utils/group-scopes';
import styled, { css } from 'styled-components';

import DecryptOptions from '../decrypt-options';
import VaultProxyOptions from '../vault-proxy-options';

export type ScopesProps = {
  scopes: RoleScope[];
};

const Scopes = ({ scopes }: ScopesProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.settings.roles' });
  const { isAdmin, decryptOptions, basicScopes, vaultProxyOptions } = groupScopes(scopes);

  if (isAdmin) {
    return <span>{t('scopes.admin')}</span>;
  }

  return (
    <Tags>
      {basicScopes.map(scope => {
        const label = t(`scopes.${scope.kind}` as ParseKeys<'common'>) as unknown as string;

        return <Tag key={scope.kind}>{label}</Tag>;
      })}
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
