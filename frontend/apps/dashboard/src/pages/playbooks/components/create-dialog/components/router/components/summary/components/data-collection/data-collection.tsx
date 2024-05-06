import { InlineAlert } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { isAuth, isIdDoc, isKyb, isKyc } from 'src/pages/playbooks/utils/kind';
import styled, { css } from 'styled-components';

import {
  OnboardingTemplate,
  type SummaryMeta,
} from '@/playbooks/utils/machine/types';

import Auth from './components/auth';
import Business from './components/business';
import Document from './components/document';
import Investor from './components/investor';
import Person from './components/person';

type DataCollectionProps = {
  meta: SummaryMeta;
};

const DataCollection = ({ meta }: DataCollectionProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.dialog.summary.data-collection',
  });
  const isAlpaca = meta.onboardingTemplate === OnboardingTemplate.Alpaca;

  if (isAuth(meta.kind)) {
    return (
      <Container>
        <Auth />
      </Container>
    );
  }

  if (isIdDoc(meta.kind)) {
    return (
      <Container>
        <Document />
      </Container>
    );
  }

  return (
    <Container>
      {isKyb(meta.kind) && <Business />}
      <Person meta={meta} />
      {isKyc(meta.kind) && !isAlpaca && <Investor />}
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
