import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { Box, Container, media, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import LinkButton from 'src/components/linking-button';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';
import ComparisonTable from './components/comparison-table';
import HorizontalCard from './components/horizontal-card';
import Biometrics from './components/illustrations/biometrics';
import BoostConversions from './components/illustrations/boost-conversions';
import CodeSnippet from './components/illustrations/code-snippet';
import PiiVaulting from './components/illustrations/pii-vaulting';
import SaveMoney from './components/illustrations/save-money';
import SecurityLogs from './components/illustrations/security-logs';
import Shield from './components/illustrations/shield';
import VerticalCard from './components/vertical-card';

const Compare = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.compare' });

  return (
    <>
      <SEO title={t('html-title')} slug="/compare" />
      <Container>
        <HeroContainer>
          <Text color="primary" variant="display-2" tag="h1">
            {t('hero.title')}
          </Text>
          <Text color="secondary" variant="body-1" tag="p">
            {t('hero.subtitle')}
          </Text>
          <Box marginBottom={4} />
          <LinkButton href={`${DASHBOARD_BASE_URL}/authentication/sign-up`}>
            {t('hero.cta')}
          </LinkButton>
          <Box marginBottom={10} />
        </HeroContainer>
        <NarrowContainer>
          <Text color="secondary" variant="body-1" tag="p">
            {t('introduction')}
          </Text>
          <ComparisonTable />
        </NarrowContainer>
        <Box marginBottom={10} />
        <Text variant="display-2" textAlign="center">
          {t('why-footptint.title')}
        </Text>
        <CardsContainer>
          <HorizontalCard
            title={t('why-footptint.user-experience.title')}
            description={t('why-footptint.user-experience.description')}
            orientation="left"
          >
            <BoostConversions />
          </HorizontalCard>
          <HorizontalCard
            title={t('why-footptint.biometrics.title')}
            description={t('why-footptint.biometrics.description')}
            orientation="right"
          >
            <Biometrics />
          </HorizontalCard>
          <HorizontalCard
            title={t('why-footptint.dev-exp.title')}
            description={t('why-footptint.dev-exp.description')}
            orientation="left"
            theme="dark"
            cta={t('why-footptint.dev-exp.cta')}
            href="https://docs.onefootprint.com/kyc-with-pii/getting-started"
          >
            <CodeSnippet />
          </HorizontalCard>
          <HorizontalCard
            title={t('why-footptint.save-money.title')}
            description={t('why-footptint.save-money.description')}
            orientation="left"
            cta={t('why-footptint.save-money.cta')}
            href="/pricing"
          >
            <SaveMoney />
          </HorizontalCard>
          <VerticalCardsContainer>
            <VerticalCard
              title={t('why-footptint.pii-vaulting.title')}
              description={t('why-footptint.pii-vaulting.description')}
            >
              <PiiVaulting />
            </VerticalCard>
            <VerticalCard
              title={t('why-footptint.vault-proxy.title')}
              description={t('why-footptint.vault-proxy.description')}
            >
              <SecurityLogs />
            </VerticalCard>
          </VerticalCardsContainer>
          <HorizontalCard
            title={t('why-footptint.security-design.title')}
            description={t('why-footptint.security-design.description')}
            orientation="left"
          >
            <Shield />
          </HorizontalCard>
        </CardsContainer>
      </Container>
    </>
  );
};

const HeroContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]};
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[5]};
    margin: auto;
    max-width: 640px;
    padding-top: ${theme.spacing[10]};

    ${media.greaterThan('md')`
      max-width: 830px;
      padding-top: ${theme.spacing[8]};
    `}
  `}
`;

const NarrowContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    margin: auto;

    max-width: 640px;

    ${media.greaterThan('md')`
      max-width: 830px;
    `}
  `}
`;

const CardsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
    margin: ${theme.spacing[10]} auto ${theme.spacing[11]} auto;
  `}
`;

const VerticalCardsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};

    ${media.greaterThan('md')` 
      flex-direction: row;
      gap: ${theme.spacing[7]};
    `}
  `};
`;

export default Compare;
