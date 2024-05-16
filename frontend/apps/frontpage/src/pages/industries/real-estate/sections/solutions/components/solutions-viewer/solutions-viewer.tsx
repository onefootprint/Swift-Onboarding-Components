import { Box, Stack, Text } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const keys = [
  {
    key: 'exposed-risk-signals',
    imgPath: '/industries/real-estate/exposed-risk-signals',
    frontImgSize: { width: 650, height: 450 },
  },
  {
    key: 'case-management',
    imgPath: '/industries/real-estate/case-management',
    frontImgSize: { width: 650, height: 450 },
  },
  {
    key: 'extra-doc-collection',
    imgPath: '/industries/real-estate/extra-doc-collection',
    frontImgSize: { width: 400, height: 650 },
  },
];

const imageAppearVariants = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  visible: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.5 } },
};

const progressBarVariants = {
  initial: { width: 0 },
  animate: { width: '100%', transition: { duration: 5, ease: 'linear' } },
};

const SolutionsViewer = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.industries.real-estate.solution',
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(keys[0].key);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress < 100) {
          return prevProgress + 20; // Increment by 20% every second
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedKey]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentIndex = keys.findIndex(k => k.key === selectedKey);
      const nextIndex = (currentIndex + 1) % keys.length;
      setSelectedKey(keys[nextIndex].key);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [selectedKey]);

  const backgroundPath = `${
    keys.find(k => k.key === selectedKey)?.imgPath || ''
  }/background.png`;
  const foregroundPath = `${
    keys.find(k => k.key === selectedKey)?.imgPath || ''
  }/front.svg`;

  return (
    <ViewerContainer>
      <ImageContainer
        src={backgroundPath}
        variants={imageAppearVariants}
        initial="hidden"
        animate="visible"
        key={selectedKey}
      >
        <Image
          src={foregroundPath}
          alt="foreground"
          width={keys.find(k => k.key === selectedKey)?.frontImgSize.width || 0}
          height={
            keys.find(k => k.key === selectedKey)?.frontImgSize.height || 0
          }
        />
      </ImageContainer>
      <ProgressBar>
        <AnimatePresence>
          <Bar
            key={selectedKey}
            initial="initial"
            animate="animate"
            variants={progressBarVariants}
            onAnimationComplete={() => setProgress(100)}
            $width={`${progress}%`}
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
              setProgress(0);
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

const Bar = styled(motion.div)<{ $width: string }>`
  ${({ theme, $width }) => css`
    height: 100%;
    background-color: ${theme.backgroundColor.accent};
    position: relative;
    width: ${$width};
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

    img {
      z-index: 2;
      position: absolute;
      top: 50%;
      left: 50%;
      height: auto;
      max-width: 95%;
      border-radius: ${theme.borderRadius.default};
      overflow: hidden;
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      transform: translate(-50%, -50%);
      box-shadow: ${theme.elevation[2]};
    }
  `}
`;

export default SolutionsViewer;
