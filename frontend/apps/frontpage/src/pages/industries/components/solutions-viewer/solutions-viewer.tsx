import { Box, Stack, Text, media } from '@onefootprint/ui';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { useTimeout } from 'usehooks-ts';

const LOOP_DELAY = 10000;

export type SolutionKey = {
  key: string;
  imgPath: string;
  frontImgSize: { width: number; height: number };
  frontImgPosition?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
};

const containerAppearVariants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.5 } },
};

const progressBarVariants = {
  initial: { width: 0 },
  animate: {
    width: '100%',
    transition: { duration: LOOP_DELAY / 1000, ease: 'linear' },
  },
};

const imageVariants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.2 } },
};

const SolutionsViewer = ({ keys }: { keys: SolutionKey[] }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries',
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(keys[0].key);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { margin: '0px 100px -50px 0px' });

  const getNextKey = () => {
    const currentIndex = keys.findIndex(k => k.key === selectedKey);
    const nextIndex = (currentIndex + 1) % keys.length;
    return keys[nextIndex].key;
  };

  useTimeout(() => {
    setSelectedKey(getNextKey());
  }, LOOP_DELAY);

  const handleAnimationComplete = () => {
    setSelectedKey(getNextKey());
  };

  const backgroundPath = `${keys.find(k => k.key === selectedKey)?.imgPath || ''}/background.png`;
  const foregroundPath = `${keys.find(k => k.key === selectedKey)?.imgPath || ''}/front.svg`;

  return (
    <ViewerContainer ref={containerRef}>
      <ImageContainer
        src={backgroundPath}
        variants={containerAppearVariants}
        initial="hidden"
        animate="visible"
        key={selectedKey}
      >
        <FrontImage
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          src={foregroundPath}
          alt="foreground"
          width={keys.find(k => k.key === selectedKey)?.frontImgSize.width || 0}
          height={keys.find(k => k.key === selectedKey)?.frontImgSize.height || 0}
          $position={keys.find(k => k.key === selectedKey)?.frontImgPosition}
        />
      </ImageContainer>
      <ProgressBar>
        <AnimatePresence>
          <Bar
            key={selectedKey}
            initial="initial"
            animate={isInView ? 'animate' : 'initial'}
            variants={progressBarVariants}
            onAnimationComplete={handleAnimationComplete}
          />
        </AnimatePresence>
      </ProgressBar>
      <Options>
        {keys.map(({ key }) => (
          <OptionButton
            key={key}
            data-selected={selectedKey === key}
            onClick={() => {
              setSelectedKey(key);
            }}
          >
            <Text variant="label-1" tag="h3">
              {t(`${key}.title` as unknown as ParseKeys<'common'>)}
            </Text>
            <Text variant="body-2" tag="p">
              {t(`${key}.subtitle` as unknown as ParseKeys<'common'>)}
            </Text>
          </OptionButton>
        ))}
      </Options>
    </ViewerContainer>
  );
};

const ViewerContainer = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[9]};
    width: 100%;
    overflow: hidden;
  `}
`;

const Bar = styled(motion.div)`
  ${({ theme }) => css`
    height: 100%;
    background-color: ${theme.backgroundColor.accent};
    position: relative;
  `}
`;

const ProgressBar = styled.div`
  ${({ theme }) => css`
    width: 80px;
    height: 2px;
    background-color: ${theme.backgroundColor.senary};
    position: relative;
  `}
`;

const Options = styled(Box)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-auto-rows: auto;
  grid-gap: 1rem;
  width: 100%;
`;

const OptionButton = styled.button`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    user-select: none;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};
    cursor: pointer;
    padding: ${theme.spacing[7]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.transparent};
    transition: color 0.2s ease-in-out;

    p,
    h3 {
      color: ${theme.color.quaternary};
    }

    &[data-selected='true'] {
      h3 {
        color: ${theme.color.primary};
      }
      p {
        color: ${theme.color.secondary};
      }
    }
  `}
`;

const ImageContainer = styled(motion(Stack))<{ src: string }>`
  ${({ src, theme }) => css`
    background-image: url(${src});
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 500px;
    flex-shrink: 0;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.09);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    }
  `}
`;

const FrontImage = styled(motion(Image))<{
  $position?: { top?: string; left?: string; right?: string; bottom?: string };
}>`
  ${({ theme, $position }) => css`
    z-index: 2;
    position: absolute;
    top: ${$position?.top || '50%'};
    left: ${$position?.left || '50%'};
    right: ${$position?.right || '50%'};
    bottom: ${$position?.bottom || '50%'};
    height: auto;
    max-width: 95%;
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    transform: translate(-50%, -50%);
    box-shadow: ${theme.elevation[2]};

    ${media.greaterThan('md')`
      max-width: 100%;
    `}
  `}
`;

export default SolutionsViewer;
