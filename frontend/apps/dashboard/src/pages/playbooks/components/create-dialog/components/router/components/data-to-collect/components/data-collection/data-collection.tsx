import { InlineAlert } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { isAuth, isDocOnly, isKyb, isKyc } from 'src/pages/playbooks/utils/kind';
import styled, { css } from 'styled-components';

import { type DataToCollectMeta, OnboardingTemplate } from '@/playbooks/utils/machine/types';

import AdditionalDocsPanel from './components/additional-docs-panel';
import Auth from './components/auth';
import Business from './components/business';
import GovDocsWithPanel from './components/gov-docs-with-panel';
import Investor from './components/investor';
import Person from './components/person';

type DataCollectionProps = {
  meta: DataToCollectMeta;
};

const DataCollection = ({ meta }: DataCollectionProps) => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.data-collection',
  });
  const isCustom = meta.onboardingTemplate === OnboardingTemplate.Custom;

  if (isAuth(meta.kind)) {
    return (
      <Container>
        <Auth />
      </Container>
    );
  }

  if (isDocOnly(meta.kind)) {
    return (
      <Container>
        <GovDocsWithPanel />
        <AdditionalDocsPanel />
      </Container>
    );
  }

  return (
    <Container>
      {isKyb(meta.kind) && <Business />}
      <Person meta={meta} />
      <GovDocsWithPanel />
      <AdditionalDocsPanel />
      {isKyc(meta.kind) && isCustom && <Investor />}
      {isKyb(meta.kind) && <InlineAlert variant="info">{t('alert')}</InlineAlert>}
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
