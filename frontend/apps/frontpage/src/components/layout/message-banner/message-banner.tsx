import { IcoCloseSmall16 } from '@onefootprint/icons';
import { Stack, createFontStyles, media } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type MessageBannerProps = {
  onClose: () => void;
  showBanner: boolean;
  articleUrl: string;
  text: string;
};

export const CASE_STUDY_BANNER_PORTAL_ID = 'banner-portal';

const MessageBanner = ({ onClose, articleUrl, text, showBanner }: MessageBannerProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.message-banner',
  });

  const containerVariants = {
    initial: { opacity: 1, height: 'auto' },
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
            {text}
            <StyledLink href={articleUrl}>{t('cta')}</StyledLink>
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
    position: relative;
    padding: ${theme.spacing[3]} ${theme.spacing[9]};
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    text-align: center;
    width: 100%;

    ${media.greaterThan('md')`
      flex-direction: row;
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

const StyledLink = styled(Link)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.accent};
    margin-left: ${theme.spacing[3]};
    text-decoration: none;
  `}
`;

export default MessageBanner;
