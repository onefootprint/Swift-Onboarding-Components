import { Container, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import SectionSubtitle from '../../components/section-subtitle';
import SectionTitle from '../../components/section-title';
import DesktopMap from './components/desktop-map';
import MobileMap from './components/mobile-map/mobile-map';

const DeviceInsights = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.vaulting.device-insights',
  });
  return (
    <StyledContainer>
      <Title>
        <DeviceInsightsImage>
          <Image src="/vaulting/device-insights/device-insights-section.png" width={339} height={360} alt="" />
        </DeviceInsightsImage>
        <TitleContainer>
          <SectionTitle variant="display-2">{t('title')}</SectionTitle>
          <SectionSubtitle $maxWidth="500px">{t('subtitle')}</SectionSubtitle>
        </TitleContainer>
      </Title>
      <DesktopMap />
      <MobileMap />
    </StyledContainer>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[11]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[10]};
    align-items: center;

    ${media.greaterThan('md')`
      margin-top: ${theme.spacing[15]};
    `}
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
    position: relative;
  `}
`;

const DeviceInsightsImage = styled.div`
  position: relative;
  height: 174px;
  width: 360px;
  mask: radial-gradient(
    80% 100% at 50% 0%,
    black 0%,
    black 75%,
    transparent 100%
  );
  mask-mode: alpha;
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    margin-top: calc(-1 * ${theme.spacing[9]});
  `}
`;

export default DeviceInsights;
