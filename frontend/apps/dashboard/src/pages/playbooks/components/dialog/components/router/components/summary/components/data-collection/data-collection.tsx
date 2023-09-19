import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { InlineAlert } from '@onefootprint/ui';
import React from 'react';

import type { SummaryMeta } from '@/playbooks/utils/machine/types';
import { PlaybookKind } from '@/playbooks/utils/machine/types';

import Business from './components/business';
import Investor from './components/investor';
import Person from './components/person';

type DataCollectionProps = {
  meta: SummaryMeta;
};

const DataCollection = ({ meta }: DataCollectionProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.summary.data-collection',
  );

  return (
    <Container>
      {meta.kind === PlaybookKind.Kyb && <Business />}
      <Person meta={meta} />
      {meta.kind === PlaybookKind.Kyc && <Investor />}
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
