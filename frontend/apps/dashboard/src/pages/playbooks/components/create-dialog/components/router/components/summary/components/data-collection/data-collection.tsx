import styled, { css } from '@onefootprint/styled';
import { InlineAlert } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { isAuth, isKyb, isKyc } from 'src/pages/playbooks/utils/kind';

import type { SummaryMeta } from '@/playbooks/utils/machine/types';

import Auth from './components/auth';
import Business from './components/business';
import Investor from './components/investor';
import Person from './components/person';

type DataCollectionProps = {
  meta: SummaryMeta;
};

const DataCollection = ({ meta }: DataCollectionProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.summary.data-collection',
  });

  return (
    <Container>
      {isKyb(meta.kind) && <Business />}
      {isAuth(meta.kind) ? <Auth /> : <Person meta={meta} />}
      {isKyc(meta.kind) && <Investor />}
      {isKyb(meta.kind) && (
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
