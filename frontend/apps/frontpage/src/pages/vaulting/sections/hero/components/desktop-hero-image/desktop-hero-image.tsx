import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

const DesktopHeroImage = () => (
  <ImageContainer
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
  />
);

const ImageContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: none;
    width: 100%;
    max-width: 1200px;
    height: 430px;
    margin: auto;
    background: url('/vaulting/hero/dashboard-dark.png') no-repeat;
    background-size: cover;
    background-position: top;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    mask: radial-gradient(
      100% 100% at 50% 0%,
      black 0%,
      black 50%,
      transparent 100%
    );
    mask-mode: alpha;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        180deg,
        rgba(150, 160, 165) 0%,
        transparent 100%
      );
      mix-blend-mode: overlay;
    }

    ${media.greaterThan('md')`
      display: block;
    `}
  `}
`;

export default DesktopHeroImage;
