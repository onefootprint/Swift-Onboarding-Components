import { IcoCloseSmall16 } from '@onefootprint/icons';
import { LinkButton, Stack, createFontStyles, media } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

type MessageBannerProps = {
  onClose: () => void;
  showBanner: boolean;
  articleUrl: string;
  text: string;
  cta: string;
};

export const CASE_STUDY_BANNER_PORTAL_ID = 'banner-portal';

const MessageBanner = ({ onClose, articleUrl, text, cta, showBanner }: MessageBannerProps) => {
  const containerVariants = {
    initial: { opacity: 1, height: 0 },
    animate: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.1 },
      transitionEnd: { display: 'none' },
    },
  };

  const textVariants = {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: 1, delay: 0 },
    },
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <Container variants={containerVariants} initial="initial" animate="animate" exit="exit">
          <motion.p variants={textVariants} initial="initial" animate="animate">
            {text}.{' '}
            <LinkButton href={articleUrl} target="_blank" variant="label-3">
              {cta}
            </LinkButton>
          </motion.p>
          <CloseButtonContainer onClick={onClose}>
            <IcoCloseSmall16 />
          </CloseButtonContainer>
        </Container>
      )}
    </AnimatePresence>
  );
};

const Container = styled(motion(Stack))`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.primary};
    align-items: center;
    justify-content: center;
    display: flex;
    min-height: 72px;
    position: relative;
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    text-align: center;
    width: 100%;
    padding: 0 ${theme.spacing[6]};

    ${media.greaterThan('md')`
      padding: 0;
      flex-direction: row;
      min-height: 40px;
    `}
  `}
`;

const CloseButtonContainer = styled.button`
  ${({ theme }) => css`
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${theme.spacing[7]};
    width: ${theme.spacing[7]};
    position: absolute;
    right: ${theme.spacing[5]};
    top: 50%;
    transform: translateY(-50%);
  `}
`;

export default MessageBanner;
