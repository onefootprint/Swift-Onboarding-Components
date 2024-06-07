import { IcoCheckCircle24, IcoDatabase24, IcoEye24, IcoLock24, IcoShield40 } from '@onefootprint/icons';
import { Box, Container, Grid, Stack, Text, media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import FeatureCard from './components/feature-card';
import Footer from './components/footer';
import Illustration from './components/illustration';
import Navigation from './components/navigation';

const Ending = () => {
  const { t } = useTranslation('common', { keyPrefix: 'ending' });

  return (
    <>
      <SEO title={t('title')} description={t('description')} />
      <Navigation />
      <StyledContainer>
        <HeadingContainer>
          <Stack
            fontStyle="label-4"
            borderWidth={1}
            borderColor="tertiary"
            borderRadius="full"
            paddingTop={1}
            paddingBottom={1}
            paddingLeft={5}
            paddingRight={5}
            marginBottom={4}
          >
            {t('chip')}
          </Stack>
          <Text tag="h1" variant="display-2" color="primary">
            {t('title')}
          </Text>
          <Text tag="h2" variant="display-4" color="secondary" maxWidth="600px">
            {t('subtitle')}
          </Text>
        </HeadingContainer>
        <Illustration />
        <Stack
          direction="column"
          align="center"
          justify="center"
          textAlign="center"
          gap={4}
          marginTop={10}
          maxWidth="856px"
        >
          <Text tag="h3" variant="display-3" color="primary">
            {t('new-approach.title')}
          </Text>
          <Text tag="p" variant="body-1" color="secondary" maxWidth="600px">
            {t('new-approach.description')}
          </Text>
          <Box marginBottom={5} />
          <FeaturesContainer>
            <Stack direction="column" align="center" justify="center" textAlign="center" gap={5}>
              <IcoShield40 />
              <Text tag="h2" variant="heading-2">
                {t('features.title')}
              </Text>
            </Stack>
            <FeaturesGrid columns={['repeat(1, 1fr)']} paddingTop={4} paddingBottom={4}>
              <FeatureCard title={t('features.zero-trust.title')} description={t('features.zero-trust.description')}>
                <IcoEye24 />
              </FeatureCard>
              <FeatureCard title={t('features.end-to-end.title')} description={t('features.end-to-end.description')}>
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
        </Stack>
      </StyledContainer>
      <Footer />
    </>
  );
};

const FeaturesGrid = styled(Grid.Container)`
  ${media.greaterThan('sm')`
      grid-template-columns: repeat(2, 1fr);
    `}
`;

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[11]};
    padding: ${theme.spacing[10]} 0;
  `};
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
    -webkit-backdrop-filter: blur(20px);

    ${media.greaterThan('md')`
      padding: ${theme.spacing[9]};
    `}
  `};
`;

export default Ending;
