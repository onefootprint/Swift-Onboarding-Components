import { useTranslation } from '@onefootprint/hooks';
import { IcoDollar24, IcoEye24, IcoShield24 } from '@onefootprint/icons';
import { Container, media, Typography } from '@onefootprint/ui';
import dynamic from 'next/dynamic';
import React from 'react';
import styled, { css } from 'styled-components';

import FeatureElement from '../../components/feature-element/feature-element';

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
      <StyledContainer>
        <Header>
          <Typography as="h2" variant="display-1" color="quinary">
            {t('title')}
          </Typography>
          <Typography as="p" variant="body-1" color="quinary">
            {t('subtitle')}
          </Typography>
          x
        </Header>
        <Features>
          <FeatureElement
            title={t('features.feature-1.title')}
            body={t('features.feature-1.body')}
            colorTheme="dark"
          >
            <IcoShield24 color="quinary" />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-2.title')}
            body={t('features.feature-2.body')}
            colorTheme="dark"
          >
            <IcoEye24 color="quinary" />
          </FeatureElement>
          <FeatureElement
            title={t('features.feature-3.title')}
            body={t('features.feature-3.body')}
            colorTheme="dark"
          >
            <IcoDollar24 color="quinary" />
          </FeatureElement>
        </Features>
        <DynamicDesktopIllustration />
        <DynamicTabletIllustration />
        <DynamicMobileIllustration />
      </StyledContainer>
    </Background>
  );
};

const Background = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.tertiary};
    padding: ${theme.spacing[13]} 0 ${theme.spacing[10]} 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[6]};
    width: 100%;
    text-align: center;
    overflow: hidden;
    background: linear-gradient(
        360deg,
        ${theme.backgroundColor.tertiary} 0%,
        ${theme.backgroundColor.transparent} 100%
      ),
      url('/home/vault-proxy/background-transparency.png'),
      ${theme.backgroundColor.tertiary};
  `}
  background-repeat: no-repeat;
  background-size: cover;
  background-blend-mode: normal, luminosity, normal;
  background-position: center;
`;

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
  `}
`;

const Features = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
    width: 100%;

    ${media.greaterThan('md')`
        flex-direction: row;
        padding: ${theme.spacing[9]} 0 ${theme.spacing[10]} 0;
    `}
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[3]};
    width: 100%;
    text-align: center;
  `}
`;

export default VaultProxy;
