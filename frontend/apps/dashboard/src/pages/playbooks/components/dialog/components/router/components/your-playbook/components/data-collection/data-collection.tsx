import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { InlineAlert } from '@onefootprint/ui';
import React from 'react';

import { Kind } from '@/playbooks/utils/machine/types';

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
      {kind === Kind.KYB && <BusinessInformation />}
      <PersonalInfoAndDocs kind={kind} />
      {kind === Kind.KYC && <InvestorProfile />}
      {kind === Kind.KYB && (
        <InlineAlert variant="info">{t('alert')}</InlineAlert>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `};
`;

export default DataCollection;
