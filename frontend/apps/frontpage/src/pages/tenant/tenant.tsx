import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoCheckCircle24, IcoDatabase24, IcoEye24, IcoLock24, IcoShield40 } from '@onefootprint/icons';
import { Grid, Stack, Text, media } from '@onefootprint/ui';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import FeatureCard from './components/feature-card';
import PartnersLogos from './components/partners-logos';

type TenantPageProps = {
  tenant: {
    logoUrl: string;
    name: string;
  };
};

const TenantPage = ({ tenant }: TenantPageProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.tenant' });

  return (
    <>
      <Head>
        {tenant.name ? (
          <>
            <title>{t('html-title-custom', { tenantName: tenant.name })}</title>
            <meta property="og:title" content={t('html-title-custom', { tenantName: tenant.name })} />
            <meta property="og:description" content={t('html-description', { tenantName: tenant.name })} />
          </>
        ) : (
          <>
            <title>{t('html-title')}</title>
            <meta property="og:title" content={t('html-title')} />
            <meta property="og:description" content={t('html-description')} />
          </>
        )}
        {tenant.logoUrl ? (
          <meta property="og:image" content={`${FRONTPAGE_BASE_URL}/api/tenant-og?logo_url=${tenant.logoUrl}`} />
        ) : null}
      </Head>
      <StyledContainer align="center" justify="center" direction="column" gap={10} paddingTop={10} paddingBottom={12}>
        <PartnersLogos tenantName={tenant.name} tenantLogoUrl={tenant.logoUrl} />
        <HeadingContainer
          align="center"
          justify="center"
          textAlign="center"
          direction="column"
          gap={5}
          maxWidth="600px"
        >
          <Text tag="h1" variant="display-2">
            {t('title')}
          </Text>
          <Text tag="p" variant="display-4" color="secondary">
            {t('subtitle', { tenantName: tenant.name })}
          </Text>
        </HeadingContainer>
        <FeaturesContainer
          align="center"
          justify="center"
          maxWidth="856px"
          direction="column"
          paddingTop={9}
          paddingBottom={9}
          paddingLeft={5}
          paddingRight={5}
          borderRadius="default"
          gap={8}
        >
          <Stack direction="column" align="center" justify="center" textAlign="center" gap={5}>
            <IcoShield40 />
            <Text tag="h2" variant="heading-2">
              {t('features.title')}
            </Text>
          </Stack>
          <FeaturesGrid columns={['repeat(1, 1fr)']} paddingTop={4} paddingBottom={4}>
            <FeatureCard title={t('features.feature-1.title')} description={t('features.feature-1.description')}>
              <IcoEye24 />
            </FeatureCard>
            <FeatureCard title={t('features.feature-2.title')} description={t('features.feature-2.description')}>
              <IcoLock24 />
            </FeatureCard>
            <FeatureCard title={t('features.feature-3.title')} description={t('features.feature-3.description')}>
              <IcoDatabase24 />
            </FeatureCard>
            <FeatureCard title={t('features.feature-4.title')} description={t('features.feature-4.description')}>
              <IcoCheckCircle24 />
            </FeatureCard>
          </FeaturesGrid>
        </FeaturesContainer>
      </StyledContainer>
    </>
  );
};

const FeaturesGrid = styled(Grid.Container)`
  ${media.greaterThan('sm')`
      grid-template-columns: repeat(2, 1fr);
    `}
`;

const StyledContainer = styled(Stack)`
  background: radial-gradient(70% 40% at 60% 60%, #e9e3ff 4%, transparent 80%);

  ${media.greaterThan('md')`
      background: radial-gradient(
          30% 60% at 70% 60%,
          #e9e3ff 4%,
          transparent 80%
        ),
        radial-gradient(30% 50% at 20% 50%, #f6ffe8 0%, transparent 100%);
    `};
`;

const HeadingContainer = styled(Stack)`
  margin: 0 auto;
`;

const FeaturesContainer = styled(Stack)`
  ${({ theme }) => css`
    margin: 0 auto;
    box-shadow: ${theme.elevation[2]};
    background-color: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);

    ${media.greaterThan('md')`
      padding: ${theme.spacing[9]};
    `}
  `};
`;

export default TenantPage;
