import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import InvestorProfile from './components/investor-profile';
import PersonalInfoAndDocs from './components/personal-info-and-docs';

const DataCollection = () => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.data-collection',
  );
  return (
    <Container>
      <Header>
        <Typography variant="label-2">{t('title')}</Typography>
        <Typography variant="body-3">{t('subtitle')}</Typography>
      </Header>
      <PersonalInfoAndDocs />
      <InvestorProfile />
    </Container>
  );
};

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `};
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `};
`;

export default DataCollection;
