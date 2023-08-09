import { useTranslation } from '@onefootprint/hooks';
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
import styled, { css } from '@onefootprint/styled';
import { Container, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

import FeatureCard from '../../components/feature-card';
import SectionSubtitle from '../../components/section-subtitle';
import SectionTitle from '../../components/section-title';

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
  const { t } = useTranslation('pages.vaulting.all-features');
  return (
    <StyledContainer>
      <Title>
        <AllFeaturesImage>
          <Image
            src="/vaulting/all-features/all-features-section.png"
            width={444}
            height={247}
            alt=""
          />
        </AllFeaturesImage>
        <TitleContainer>
          <SectionTitle variant="display-1" maxWidth={460} multiline>
            {t('title')}
          </SectionTitle>
          <SectionSubtitle maxWidth={500}>{t('subtitle')}</SectionSubtitle>
        </TitleContainer>
      </Title>
      <Grid>
        {featureCards.map(card => (
          <FeatureCard
            key={card.id}
            title={t(`bullets.${card.id}.title`)}
            subtitle={t(`bullets.${card.id}.subtitle`)}
            icon={card.icon}
            gridArea={card.id}
          />
        ))}
      </Grid>
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

const Grid = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: 1fr;
  grid-template-rows: repeat(8, 1fr);
  grid-template-areas:
    'manual-review'
    'auth-iam'
    'fraud-risk'
    'security-logs'
    'watchlists'
    'kyc-retrigger'
    'free-form-notes'
    'field-validations';

  ${media.greaterThan('md')`
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(2, 1fr);
      grid-template-areas:
        'manual-review auth-iam fraud-risk security-logs'
        'watchlists kyc-retrigger free-form-notes field-validations';
    `}
`;

const AllFeaturesImage = styled.div`
  position: relative;
  height: 185px;
  width: 100%;
  overflow: hidden;
  mask-mode: alpha;
  mask: radial-gradient(
    50% 80% at 50% 0%,
    black 0%,
    black 75%,
    transparent 100%
  );

  ${media.greaterThan('md')`
    height: 185px;
    mask: radial-gradient(
      70% 80% at 50% 0%,
      black 0%,
      black 75%,
      transparent 100%
    );
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    margin-top: calc(-1 * ${theme.spacing[10]});
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `}
`;

export default AllFeatures;
