import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { InlineAlert } from '@onefootprint/ui';
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import type { SummaryMeta } from '@/playbooks/utils/machine/types';
import { PlaybookKind } from '@/playbooks/utils/machine/types';

import BusinessInformation from './components/business-information';
import InvestorProfile from './components/investor-profile';
import PersonalInfoAndDocs from './components/personal-info-and-docs';

type DataCollectionProps = {
  meta: SummaryMeta;
};

const DataCollection = ({ meta }: DataCollectionProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.summary.data-collection',
  );
  const { setValue } = useFormContext();

  useEffect(() => {
    setValue('meta', meta);
  }, [meta, setValue]);

  return (
    <Container>
      {meta.kind === PlaybookKind.Kyb && <BusinessInformation />}
      <PersonalInfoAndDocs meta={meta} />
      {meta.kind === PlaybookKind.Kyc && <InvestorProfile />}
      {meta.kind === PlaybookKind.Kyb && (
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
