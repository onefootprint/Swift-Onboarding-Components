import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import SectionTitle from 'src/pages/vaulting/components/section-title';
import styled, { css, keyframes } from 'styled-components';

import Sparkles from './components/sparkles';

type ToggleButtonProps = {
  isDecrypted: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const ToggleButton = ({
  children,
  isDecrypted,
  onClick,
}: ToggleButtonProps) => (
  <Container
    key={isDecrypted ? 'button' : 'button2'}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
    whileHover={{
      y: -2,
      scale: 1.01,
      transition: { duration: 0.2, ease: 'easeOut' },
    }}
  >
    <Sparkles color="white">
      <StyledButton>
        <SectionTitle variant="display-3">{children}</SectionTitle>
      </StyledButton>
    </Sparkles>
    <Border />
  </Container>
);

const StyledButton = styled(motion.button)`
  ${({ theme }) => css`
    all: unset;
    position: relative;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.lg};
    cursor: pointer;
    color: ${theme.color.secondary};
    overflow: hidden;
    padding: ${theme.spacing[3]} ${theme.spacing[8]};
    z-index: 1;
  `}
`;

const Border = styled.span`
  ${({ theme }) => css`
    z-index: 0;
    position: absolute;
    width: calc(100% + ${theme.spacing[1]} * 1.2);
    height: calc(100% + ${theme.spacing[1]} * 1.2);
    border-radius: calc(${theme.borderRadius.lg} + ${theme.spacing[1]} * 1.2);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${theme.backgroundColor.primary};
    background: radial-gradient(
      50% 50% at 50% 50%,
      rgba(206, 195, 255, 0.8) 0%,
      ${theme.backgroundColor.secondary} 100%
    );
    background-size: 200% 200%;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    transition: background-size 0.2s ease-in-out;
    animation: ${rotate} 7s linear infinite;
  `}
`;

const Container = styled(motion.span)`
  ${({ theme }) => css`
    position: relative;
    margin: ${theme.spacing[7]} auto 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    isolation: isolate;
    cursor: pointer;
    width: fit-content;

    &::before {
      z-index: 3;
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      background: radial-gradient(
        50% 100% at 50% 20%,
        rgba(206, 195, 255, 0.25) 0%,
        ${theme.backgroundColor.transparent} 100%
      );
    }

    ${media.greaterThan('md')`
       margin: ${theme.spacing[4]} auto 0 auto;
    `}
  `}
`;

const rotate = keyframes`
  0% {
    background-position: 0% 0%;
  }
  25% {
    background-position: 0% 100%;
  }
  50% {
    background-position: 100% 100%;
  }
  75% {
    background-position: 100% 0%;
  }
  100% {
    background-position: 0% 0%;
  }
`;

export default ToggleButton;
