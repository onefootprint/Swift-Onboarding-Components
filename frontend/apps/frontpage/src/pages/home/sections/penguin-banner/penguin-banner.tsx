import { useTranslation } from '@onefootprint/hooks';
import { Button, Container, media, Typography } from '@onefootprint/ui';
import { createPopup } from '@typeform/embed';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

const PenguinBanner = () => {
  const { t } = useTranslation('pages.home.banner');
  const { toggle: toggleTypeform } = createPopup('COZNk70C');
  return (
    <Clipper>
      <ColorBackground />
      <NoiseLayer />
      <Container as="section" id="penguin-banner">
        <ContentWrapper>
          <Image
            src="/new-home/banner/penguin.png"
            height={190}
            width={268}
            alt={t('alt')}
          />
          <ResponsiveHide data-viewport="tablet-desktop">
            <Typography as="h2" variant="display-1">
              {t('title')}
            </Typography>
          </ResponsiveHide>
          <ResponsiveHide data-viewport="mobile">
            <Typography as="h2" variant="display-2">
              {t('title')}
            </Typography>
          </ResponsiveHide>
          <Button onClick={toggleTypeform}> {t('cta')}</Button>
        </ContentWrapper>
      </Container>
    </Clipper>
  );
};

const Clipper = styled.div`
  ${({ theme }) => css`
    width: 100%;
    height: 100%;
    position: relative;
    clip-path: polygon(0 12%, 100% 0%, 100% 100%, 0 100%);
    padding: ${theme.spacing[12]} 0 ${theme.spacing[14]} 0;
    margin-top: ${theme.spacing[8]};

    ${media.greaterThan('md')`
      margin-top: ${theme.spacing[10]};
      clip-path: polygon(0 20%, 100% 0%, 100% 100%, 0 100%);
      padding: ${theme.spacing[15]} 0 ${theme.spacing[14]} 0;
    `};
  `}
`;

const ContentWrapper = styled.div`
  ${({ theme }) => css`
    max-width: 720px;
    margin: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: auto;
    gap: ${theme.spacing[9]};
    z-index: 1;
    text-align: center;
    padding-top: ${theme.spacing[10]};
  `}
`;

const ResponsiveHide = styled.span`
  &[data-viewport='mobile'] {
    display: block;

    ${media.greaterThan('sm')`
      display: none;
    `}
  }

  &[data-viewport='tablet-desktop'] {
    display: none;

    ${media.greaterThan('sm')`
      display: block;
    `}
  }
`;

const ColorBackground = styled.div`
  z-index: 0;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-size: cover;
  background: radial-gradient(
      at 35% 60%,
      rgba(229, 246, 193, 0.5) 8%,
      rgba(255, 255, 255, 0) 30%
    ),
    radial-gradient(
      at 0% 0%,
      rgba(203, 193, 246, 0.5) 0%,
      rgba(255, 255, 255, 0) 80%
    ),
    radial-gradient(
      at 70% 0%,
      rgba(246, 209, 193, 1) 0%,
      rgba(255, 255, 255, 0) 48%
    ),
    radial-gradient(
      at 60% 10%,
      rgba(200, 228, 255, 1) 0%,
      rgba(200, 228, 255, 0) 100%
    );
`;

const NoiseLayer = styled.div`
  position: absolute;
  background-image: url('/new-home/hero/noise.png');
  background-blend-mode: overlay;
  opacity: 0.1;
  width: 100%;
  height: 100%;
  background-size: cover;
  top: 0;
  left: 0;
  -webkit-mask-image: -webkit-gradient(
    linear,
    left top,
    left bottom,
    from(rgba(0, 0, 0, 1)),
    to(rgba(0, 0, 0, 0))
  );
`;

export default PenguinBanner;
