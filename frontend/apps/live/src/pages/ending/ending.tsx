import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCheckCircle24,
  IcoDatabase24,
  IcoEye24,
  IcoLock24,
  IcoShield40,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Box,
  Container,
  createFontStyles,
  media,
  Typography,
} from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';

import SEO from '../../components/seo';
import FeatureCard from './components/feature-card';
import Footer from './components/footer';
import Illustration from './components/illustration';
import Navigation from './components/navigation';

const Ending = () => {
  const { t } = useTranslation('ending');

  return (
    <>
      <SEO title={t('title')} description={t('description')} />
      <Navigation />
      <StyledContainer>
        <HeadingContainer>
          <Chip>{t('chip')}</Chip>
          <Typography as="h1" variant="display-2" color="primary">
            {t('title')}
          </Typography>
          <Typography
            as="h2"
            variant="display-4"
            color="secondary"
            sx={{ maxWidth: '600px' }}
          >
            {t('subtitle')}
          </Typography>
        </HeadingContainer>
        <Illustration />
        <SectionContainer>
          <Typography as="h3" variant="display-3" color="primary">
            {t('new-approach.title')}
          </Typography>
          <Typography
            as="p"
            variant="body-1"
            color="secondary"
            sx={{ maxWidth: '600px' }}
          >
            {t('new-approach.description')}
          </Typography>
          <Box marginBottom={5} />
          <FeaturesContainer>
            <TitleContainer>
              <IcoShield40 />
              <Typography as="h2" variant="heading-2">
                {t('features.title')}
              </Typography>
            </TitleContainer>
            <FeaturesGrid>
              <FeatureCard
                title={t('features.zero-trust.title')}
                description={t('features.zero-trust.description')}
              >
                <IcoEye24 />
              </FeatureCard>
              <FeatureCard
                title={t('features.end-to-end.title')}
                description={t('features.end-to-end.description')}
              >
                <IcoLock24 />
              </FeatureCard>
              <FeatureCard
                title={t('features.granular-data.title')}
                description={t('features.granular-data.description')}
              >
                <IcoDatabase24 />
              </FeatureCard>
              <FeatureCard
                title={t('features.secure-enclave.title')}
                description={t('features.secure-enclave.description')}
              >
                <IcoCheckCircle24 />
              </FeatureCard>
            </FeaturesGrid>
          </FeaturesContainer>
        </SectionContainer>
      </StyledContainer>
      <Footer />
    </>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[11]};
    padding: ${theme.spacing[10]} 0;
  `};
`;

const Chip = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-4')};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary}};
    border-radius: ${theme.borderRadius.full};
    padding: ${theme.spacing[1]} ${theme.spacing[5]};
    margin-bottom: ${theme.spacing[4]};
  `}
`;

const HeadingContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[2]};
    text-align: center;
  `}
`;

const SectionContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${theme.spacing[4]};
    margin-top: ${theme.spacing[10]};
    max-width: 856px;
  `};
`;

const FeaturesContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
    margin: 0 auto;
    padding: ${theme.spacing[9]} ${theme.spacing[5]};
    box-shadow: ${theme.elevation[2]};
    border-radius: ${theme.borderRadius.default};
    gap: ${theme.spacing[8]};
    background-color: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(20px);

    ${media.greaterThan('md')`
      padding: ${theme.spacing[9]};
    `}
  `};
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: ${theme.spacing[5]};
  `}
`;

const FeaturesGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    padding: 0 ${theme.spacing[5]};
    padding: 0 ${theme.spacing[4]};

    ${media.greaterThan('sm')`
      grid-template-columns: repeat(2, 1fr);
    `}
  `};
`;

export default Ending;
