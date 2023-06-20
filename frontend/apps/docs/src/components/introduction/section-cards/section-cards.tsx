import { useTranslation } from '@onefootprint/hooks';
import {
  IcoDatabase24,
  IcoIdCard24,
  IcoLayer0124,
  IcoStore24,
} from '@onefootprint/icons';
import { media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SectionCard from './section-card/section-card';

const SectionCards = () => {
  const { t } = useTranslation('pages.home.quickstart');

  return (
    <Grid>
      <SectionCard
        title={t('kyc.title')}
        subtitle={t('kyc.description')}
        href="/kyc/getting-started"
        icon={IcoIdCard24}
        imageSrc="/introduction/kyc.png"
        gridArea="kyc"
      />
      <SectionCard
        title={t('kyb.title')}
        subtitle={t('kyb.description')}
        href="/kyb/getting-started"
        icon={IcoStore24}
        imageSrc="/introduction/kyb.png"
        gridArea="kyb"
      />
      <SectionCard
        title={t('vaulting.title')}
        subtitle={t('vaulting.description')}
        href="/vault/apis"
        icon={IcoDatabase24}
        imageSrc="/introduction/vaulting.png"
        gridArea="vaulting"
      />
      <SectionCard
        title={t('vault-proxy.title')}
        subtitle={t('vault-proxy.description')}
        href="/vault/proxy"
        icon={IcoLayer0124}
        imageSrc="/introduction/vault-proxy.png"
        gridArea="vault-proxy"
      />
    </Grid>
  );
};

const Grid = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: ${theme.spacing[5]};
    grid-template-rows: repeat(2, 1fr);
    grid-template-areas:
      'kyc'
      'kyb'
      'vaulting'
      'vault-proxy';

    ${media.greaterThan('md')`
         grid-template-columns: repeat(2, 1fr);
         grid-template-areas:
      'kyc kyb'
      'vaulting vault-proxy';
      `}
  `}
`;

export default SectionCards;
