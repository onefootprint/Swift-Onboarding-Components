import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import {
  IcoCheckCircle24,
  IcoDatabase24,
  IcoEye24,
  IcoLock24,
  IcoShield40,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Container, media, Typography } from '@onefootprint/ui';
import Head from 'next/head';
import React from 'react';

import FeatureCard from './components/feature-card';
import PartnersLogos from './components/partners-logos';

type TenantPageProps = {
  tenant: {
    logoUrl: string;
    name: string;
  };
};

const TenantPage = ({ tenant }: TenantPageProps) => {
  const { t } = useTranslation('pages.tenant');

  return (
    <>
      <Head>
        {tenant.name ? (
          <>
            <title>{t('html-title-custom', { tenantName: tenant.name })}</title>
            <meta
              property="og:title"
              content={t('html-title-custom', { tenantName: tenant.name })}
            />
            <meta
              property="og:description"
              content={t('html-description', { tenantName: tenant.name })}
            />
          </>
        ) : (
          <>
            <title>{t('html-title')}</title>
            <meta property="og:title" content={t('html-title')} />
            <meta property="og:description" content={t('html-description')} />
          </>
        )}
        {tenant.logoUrl ? (
          <meta
            property="og:image"
            content={`${FRONTPAGE_BASE_URL}/api/tenant-og?logo_url=${tenant.logoUrl}`}
          />
        ) : null}
      </Head>
      <StyledContainer>
        <PartnersLogos
          tenantName={tenant.name}
          tenantLogoUrl={tenant.logoUrl}
        />
        <HeadingContainer>
          <Typography as="h1" variant="display-2">
            {t('title')}
          </Typography>
          <Typography as="p" variant="display-4" color="secondary">
            {t('subtitle', { tenantName: tenant.name })}
          </Typography>
        </HeadingContainer>
        <FeaturesContainer>
          <TitleContainer>
            <IcoShield40 />
            <Typography as="h2" variant="heading-2">
              {t('features.title')}
            </Typography>
          </TitleContainer>
          <FeaturesGrid>
            <FeatureCard
              title={t('features.feature-1.title')}
              description={t('features.feature-1.description')}
            >
              <IcoEye24 />
            </FeatureCard>
            <FeatureCard
              title={t('features.feature-2.title')}
              description={t('features.feature-2.description')}
            >
              <IcoLock24 />
            </FeatureCard>
            <FeatureCard
              title={t('features.feature-3.title')}
              description={t('features.feature-3.description')}
            >
              <IcoDatabase24 />
            </FeatureCard>
            <FeatureCard
              title={t('features.feature-4.title')}
              description={t('features.feature-4.description')}
            >
              <IcoCheckCircle24 />
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesContainer>
      </StyledContainer>
    </>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: ${theme.spacing[10]} 0 ${theme.spacing[12]} 0;
    gap: ${theme.spacing[10]};
    background: radial-gradient(
      70% 40% at 60% 60%,
      #e9e3ff 4%,
      transparent 80%
    );

    ${media.greaterThan('md')`
      background: radial-gradient(
          30% 60% at 70% 60%,
          #e9e3ff 4%,
          transparent 80%
        ),
        radial-gradient(30% 50% at 20% 50%, #f6ffe8 0%, transparent 100%);
    `};
  `}
`;

const HeadingContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
    gap: ${theme.spacing[5]};
  `}
`;

const FeaturesContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    max-width: 856px;
    margin: 0 auto;
    padding: ${theme.spacing[9]} ${theme.spacing[5]};
    box-shadow: ${theme.elevation[2]};
    border-radius: ${theme.borderRadius.default};
    gap: ${theme.spacing[8]};
    background-color: rgba(255, 255, 255, 0.8);
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

export default TenantPage;
