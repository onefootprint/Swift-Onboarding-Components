import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import { AnimatePresence } from 'framer-motion';
import React, { useState } from 'react';

import IllustrationContainer from '../../components/illustration-section-title/container';
import Rectangle from '../../components/illustration-section-title/rectangle/rectangle';
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
        <IllustrationContainer>
          <Rectangle top={24} left={24} width={117} height={24} />
          <Rectangle top={80} left={24} width={90} height={24} />
          <Rectangle top={125} left={24} width={90} height={24} />
          <Rectangle top={80} left={280} width={50} height={24} />
          <Rectangle top={125} left={280} width={50} height={24} />
        </IllustrationContainer>
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
      <Box marginBottom={8} />
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
    z-index: 2;
  `};
`;

export default AllData;
