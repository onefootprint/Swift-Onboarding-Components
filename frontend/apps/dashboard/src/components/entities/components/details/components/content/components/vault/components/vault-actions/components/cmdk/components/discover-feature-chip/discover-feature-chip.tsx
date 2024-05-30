import { IcoSparkles16 } from '@onefootprint/icons';
import { Box, createFontStyles } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

type DiscoverFeatureChipProps = {
  isVisible?: boolean;
  text: string;
};

const DiscoverFeatureChip = ({ isVisible, text }: DiscoverFeatureChipProps) => (
  <AnimatePresence>
    {isVisible && (
      <DiscoverFeatureTag
        initial={{ y: 200, filter: 'blur(2px)', opacity: 0 }}
        animate={{
          y: 0,
          filter: 'blur(0px)',
          opacity: 1,
          transition: { duration: 1, delay: 1, type: 'tweek' },
        }}
        exit={{
          y: 200,
          filter: 'blur(2px)',
          opacity: 0,
          transition: { duration: 1, delay: 1, type: 'tween' },
        }}
      >
        <IcoSparkles16 color="tertiary" />
        {text}
      </DiscoverFeatureTag>
    )}
  </AnimatePresence>
);

const DiscoverFeatureTag = styled(motion(Box))`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    display: flex;
    gap: ${theme.spacing[3]};
    align-items: center;
    justify-content: center;
    background-color: ${theme.backgroundColor.primary};
    color: ${theme.color.secondary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    position: fixed;
    bottom: ${theme.spacing[4]};
    right: ${theme.spacing[4]};
    z-index: ${theme.zIndex.dialog};
    box-shadow: ${theme.elevation[2]};
  `};
`;

export default DiscoverFeatureChip;
