import {
  IcoCode24,
  IcoDatabase24,
  IcoKey24,
  IcoUsers24,
} from '@onefootprint/icons';
import { Container, Grid, media } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import FeatureCard from '../../components/feature-card';
import SectionSubtitle from '../../components/section-subtitle';
import SectionTitle from '../../components/section-title';
import DesktopHeroImage from './components/desktop-hero-image';
import MobileHeroImage from './components/mobile-hero-image';

const featureCards = [
  {
    id: 'confidential',
    icon: IcoDatabase24,
  },
  {
    id: 'trusted',
    icon: IcoCode24,
  },
  {
    id: 'vaulted',
    icon: IcoKey24,
  },
  {
    id: 'built-in',
    icon: IcoUsers24,
  },
];

const Hero = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.vaulting.hero' });

  return (
    <StyledContainer>
      <DesktopHeroImage />
      <MobileHeroImage />
      <Title>
        <SectionTitle variant="display-1">{t('title')}</SectionTitle>
        <SectionSubtitle maxWidth="640px">{t('subtitle')}</SectionSubtitle>
      </Title>
      <FeatureCardsGrid
        width="100%"
        columns={['1fr']}
        rows={['repeat(4, 1fr)']}
        marginTop={11}
      >
        {featureCards.map(card => (
          <FeatureCard
            key={card.id}
            title={t(`bullets.${card.id}.title` as ParseKeys<'common'>)}
            subtitle={t(`bullets.${card.id}.subtitle` as ParseKeys<'common'>)}
            icon={card.icon}
          />
        ))}
      </FeatureCardsGrid>
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    margin: ${theme.spacing[2]} auto ${theme.spacing[4]} auto;
    position: relative;
    display: flex;
    align-items: center;
    flex-direction: column;
    overflow: hidden;

    ${media.greaterThan('md')`
      margin: ${theme.spacing[7]} auto ${theme.spacing[15]} auto;
    `}
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[5]};
    margin-top: calc(-1 * ${theme.spacing[5]});
  `}
`;

const FeatureCardsGrid = styled(Grid.Container)`
  ${media.greaterThan('md')`
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: 1fr;
      grid-template-areas: 'confidential trusted vaulted built-in';
    `}
`;

export default Hero;
