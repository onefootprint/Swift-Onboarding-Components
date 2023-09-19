import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { InlineAlert } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { PlaybookKind } from '@/playbooks/utils/machine/types';

import BusinessInformation from './components/business-information';
import InvestorProfile from './components/investor-profile';
import PersonalInfoAndDocs from './components/personal-info-and-docs';

type DataCollectionProps = {
  kind: PlaybookKind;
};

const DataCollection = ({ kind }: DataCollectionProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.summary.data-collection',
  );
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue('kind', kind);
  }, [kind, setValue]);

  return (
    <Container>
      {kind === PlaybookKind.Kyb && <BusinessInformation />}
      <PersonalInfoAndDocs kind={kind} />
      {kind === PlaybookKind.Kyc && <InvestorProfile />}
      {kind === PlaybookKind.Kyb && (
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
