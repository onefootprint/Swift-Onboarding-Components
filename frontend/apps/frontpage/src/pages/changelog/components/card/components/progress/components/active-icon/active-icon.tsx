import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

import Circle from '../circle';

const DefaultIcon = () => (
  <Container>
    <Wave
      initial={{ height: '4px', width: '4px', opacity: 1 }}
      animate={{ height: '24px', width: '24px', opacity: 0 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
    />
    <Circle circleHeight={6} circleWidth={6} />
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    position: relative;
    justify-content: center;
    height: ${theme.spacing[7]};
    width: ${theme.spacing[7]};
    border-radius: ${theme.borderRadius.full};
    background: ${theme.backgroundColor.primary};

    svg {
      fill: ${theme.backgroundColor.quinary};
    }
  `}
`;

const Wave = styled(motion.svg)`
  ${({ theme }) => css`
    z-index: 0;
    position: absolute;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    background: ${theme.backgroundColor.quinary};
    border-radius: ${theme.borderRadius.full};
  `};
`;

export default DefaultIcon;
