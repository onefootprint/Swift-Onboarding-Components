import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import { Kind } from '../../../../utils/machine/types';
import BusinessInformation from './components/business-information';
import InvestorProfile from './components/investor-profile';
import PersonalInfoAndDocs from './components/personal-info-and-docs';

type DataCollectionProps = {
  kind: Kind;
};

const DataCollection = ({ kind }: DataCollectionProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.data-collection',
  );

  return (
    <Container>
      <Header>
        <Typography variant="label-2">{t('title')}</Typography>
        <Typography variant="body-3">{t('subtitle')}</Typography>
      </Header>
      {kind === Kind.KYB && <BusinessInformation />}
      <PersonalInfoAndDocs kind={kind} />
      {kind === Kind.KYC && <InvestorProfile />}
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
