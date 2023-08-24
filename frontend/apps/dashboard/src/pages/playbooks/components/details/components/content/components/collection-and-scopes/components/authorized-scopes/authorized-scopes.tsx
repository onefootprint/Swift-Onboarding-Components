import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import {
  basicInformationFields,
  usResidentDisplayScopes,
} from 'src/pages/playbooks/utils/machine/types';

import Section from './components/section';

export type AuthorizedScopesProps = {
  canAccessData: string[];
};

const AuthorizedScopes = ({ canAccessData }: AuthorizedScopesProps) => {
  const { t } = useTranslation(
    'pages.playbooks.table.details.content.authorized-scopes',
  );

  return (
    <Container>
      <Section
        displayScopes={basicInformationFields}
        canAccessData={canAccessData}
        title={t('basic-information')}
      />
      <Section
        displayScopes={usResidentDisplayScopes}
        canAccessData={canAccessData}
        title={t('us-residents')}
      />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default AuthorizedScopes;
