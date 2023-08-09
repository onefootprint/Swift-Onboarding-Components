import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, media } from '@onefootprint/ui';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';

import SectionSubtitle from '../../components/section-subtitle';
import SectionTitle from '../../components/section-title';
import DesktopImageGrid from './components/desktop-image-grid';
import MobileImageGrid from './components/mobile-image-grid/mobile-image-grid';
import ToggleButton from './components/toggle-button';

const AllData = () => {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const { t } = useTranslation('pages.vaulting.all-data');

  return (
    <Container>
      <TitleContainer>
        <AllDataImage>
          <Image
            src="/vaulting/all-data/all-data-section.png"
            width={720}
            height={358}
            alt=""
          />
        </AllDataImage>
        <Title>
          <SectionTitle variant="display-1">{t('title')}</SectionTitle>
          <AnimatePresence>
            {isDecrypted ? (
              <ToggleButton
                isDecrypted={isDecrypted}
                onClick={() => setIsDecrypted(!isDecrypted)}
              >
                {t('decrypted')}
              </ToggleButton>
            ) : (
              <ToggleButton
                isDecrypted={isDecrypted}
                onClick={() => setIsDecrypted(!isDecrypted)}
              >
                {t('encrypted')}
              </ToggleButton>
            )}
          </AnimatePresence>
        </Title>
      </TitleContainer>
      <SectionSubtitle maxWidth={500}>{t('subtitle')}</SectionSubtitle>
      <Box sx={{ marginBottom: 8 }} />
      <DesktopImageGrid isDecrypted={isDecrypted} />
      <MobileImageGrid isDecrypted={isDecrypted} />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    width: 100%;
    align-items: center;
    text-align: center;
    position: relative;
    max-width: 90%;
    margin: ${theme.spacing[11]} auto 0 auto;
  `}
`;

const AllDataImage = styled.div`
  ${({ theme }) => css`
    position: relative;
    height: 174px;
    width: 90%;
    mask: radial-gradient(
      60% 100% at 50% 0%,
      black 0%,
      black 55%,
      transparent 95%
    );
    mask-mode: alpha;

    img {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      object-fit: contain;
      border-radius: ${theme.borderRadius.default};
    }

    ${media.greaterThan('md')`
      height: 174px;
      width: 360px;
      mask: radial-gradient(
        70% 100% at 50% 0%,
        black 0%,
        black 55%,
        transparent 100%
    );
    `}
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: ${theme.spacing[5]};

    &::before {
      content: '';
      position: absolute;
      pointer-events: none;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      z-index: 1;
      background: radial-gradient(
        70% 100% at 50% 0%,
        rgba(255, 255, 255, 0.5) 0%,
        transparent 50%
      );
      mix-blend-mode: overlay;
    }
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    margin-top: calc(-1 * ${theme.spacing[8]});
  `};
`;

export default AllData;
