import { useTranslation } from '@onefootprint/hooks';
import { IcoDollar16, IcoEye16, IcoShield16 } from '@onefootprint/icons';
import { Container, media } from '@onefootprint/ui';
import dynamic from 'next/dynamic';
import React from 'react';
import styled, { css } from 'styled-components';

import MicroFeatureCard from '../../micro-feature-card/micro-feature-card';
import SectionTitle from '../../section-title/section-title';

const DynamicDesktopIllustration = dynamic(
  () => import('./components/vault-illustration/desktop-illustration'),
);

const DynamicTabletIllustration = dynamic(
  () => import('./components/vault-illustration/tablet-illustration'),
);

const DynamicMobileIllustration = dynamic(
  () => import('./components/vault-illustration/mobile-illustration'),
);

const VaultProxy = () => {
  const { t } = useTranslation('pages.home.vault-proxy');

  return (
    <Background id="vault-proxy">
      <SectionTitle
        title={t('title')}
        subtitle={t('subtitle')}
        cta={t('cta')}
        icon="/home/icons/vault.png"
        darkTheme
      />
      <IllustrationContainer>
        <DynamicDesktopIllustration />
        <DynamicMobileIllustration />
        <DynamicTabletIllustration />
      </IllustrationContainer>
      <Grid>
        <MicroFeatureCard
          title={t('features.enhanced-security.title')}
          subtitle={t('features.enhanced-security.subtitle')}
          icon={IcoShield16}
          darkTheme
        />
        <MicroFeatureCard
          title={t('features.reduced-liability.title')}
          subtitle={t('features.reduced-liability.subtitle')}
          icon={IcoEye16}
          darkTheme
        />
        <MicroFeatureCard
          title={t('features.less-money.title')}
          subtitle={t('features.less-money.subtitle')}
          icon={IcoDollar16}
          darkTheme
        />
      </Grid>
    </Background>
  );
};

const Background = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.tertiary};
    padding: ${theme.spacing[9]} 0 ${theme.spacing[11]} 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    overflow: hidden;
    gap: ${theme.spacing[10]};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[12]} 0 ${theme.spacing[10]} 0;
    `}
  `}
`;

const IllustrationContainer = styled(Container)`
  width: 100%;
  position: relative;
`;

const Grid = styled(Container)`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr;

    ${media.greaterThan('md')`
      grid-template-columns: 1fr 1fr 1fr;
      margin-top: ${theme.spacing[10]};
    `}
  `}
`;

export default VaultProxy;
