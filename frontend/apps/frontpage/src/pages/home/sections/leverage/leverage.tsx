import { Container, media, Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SectionTitle from '../../../../components/desktop-share-post/section-title';
import LeverageCard from './components/leverage-card';

export const Leverage = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.leverage',
  });
  return (
    <SectionContainer>
      <SectionTitle
        title={t('title')}
        subtitle={t('subtitle')}
        align="center"
      />
      <CardsContainer>
        <LeverageCard
          variant="app-clip"
          videoSrc="/home/videos/id-scan.mp4"
          $inverted
        />
        <LeverageCard variant="passkeys" videoSrc="/home/videos/qr-scan.mp4" />
      </CardsContainer>
    </SectionContainer>
  );
};

const SectionContainer = styled(Container)`
  ${({ theme }) => css`
    flex-direction: column;
    gap: ${theme.spacing[9]};
    padding: ${theme.spacing[9]} 0;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[11]} 0;
    `}
  `}
`;

const CardsContainer = styled(Stack)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[9]} 0;
    gap: ${theme.spacing[9]};

    ${media.greaterThan('md')`
      gap: ${theme.spacing[12]};
    `}
  `}
`;

export default Leverage;
