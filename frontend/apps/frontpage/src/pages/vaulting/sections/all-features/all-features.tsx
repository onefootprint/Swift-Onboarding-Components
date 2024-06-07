import {
  IcoCheck24,
  IcoEye24,
  IcoFileText24,
  IcoPencil24,
  IcoReturn24,
  IcoShield24,
  IcoUser24,
  IcoWarning24,
} from '@onefootprint/icons';
import { Container, Grid, Stack, media } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import FeatureCard from '../../components/feature-card';
import SectionSubtitle from '../../components/section-subtitle';
import SectionTitle from '../../components/section-title';
import TitleIllustration from './components/title-illustration';

const featureCards = [
  {
    id: 'manual-review',
    icon: IcoWarning24,
  },
  {
    id: 'auth-iam',
    icon: IcoUser24,
  },
  {
    id: 'fraud-risk',
    icon: IcoShield24,
  },
  {
    id: 'security-logs',
    icon: IcoFileText24,
  },
  {
    id: 'watchlists',
    icon: IcoEye24,
  },
  {
    id: 'kyc-retrigger',
    icon: IcoReturn24,
  },
  {
    id: 'free-form-notes',
    icon: IcoPencil24,
  },
  {
    id: 'field-validations',
    icon: IcoCheck24,
  },
];

const AllFeatures = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.vaulting.all-features',
  });
  return (
    <StyledContainer>
      <Title>
        <TitleIllustration />
        <TitleContainer direction="column" gap={3} align="center">
          <SectionTitle variant="display-2" maxWidth={460} multiline>
            {t('title')}
          </SectionTitle>
          <SectionSubtitle maxWidth="500px">{t('subtitle')}</SectionSubtitle>
        </TitleContainer>
      </Title>
      <FeatureCardGrid
        columns={['1fr']}
        rows={['repeat(8, 1fr)']}
        templateAreas={[
          'manual-review',
          'auth-iam',
          'fraud-risk',
          'security-logs',
          'watchlists',
          'kyc-retrigger',
          'free-form-notes',
          'field-validations',
        ]}
      >
        {featureCards.map(card => (
          <FeatureCard
            key={card.id}
            title={t(`bullets.${card.id}.title` as ParseKeys<'common'>)}
            subtitle={t(`bullets.${card.id}.subtitle` as ParseKeys<'common'>)}
            icon={card.icon}
            gridArea={card.id}
          />
        ))}
      </FeatureCardGrid>
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[15]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[10]};
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    width: 100%;
    align-items: center;
    text-align: center;
  `}
`;

const FeatureCardGrid = styled(Grid.Container)`
  ${media.greaterThan('md')`
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      grid-template-areas:
        'manual-review auth-iam fraud-risk security-logs'
        'watchlists kyc-retrigger free-form-notes field-validations';
    `}
`;

const TitleContainer = styled(Stack)`
  ${({ theme }) => css`
    margin-top: calc(-1 * ${theme.spacing[10]});
    z-index: 2;
  `}
`;

export default AllFeatures;
