import {
  IcoCheck16,
  IcoDatabase24,
  IcoFootprint40,
  IcoUsers24,
} from '@onefootprint/icons';
import { media } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import React from 'react';
import styled, { css } from 'styled-components';

const SaveMoney = () => (
  <Container>
    <IconsContainer>
      <IconContainer data-type="medium">
        <IcoUsers24 />
      </IconContainer>
      <Line data-type="long">
        <Spark
          initial={{
            x: 0,
            opacity: 0,
          }}
          animate={{
            x: 78,
            opacity: [0, 1, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              repeatDelay: 2,
            },
          }}
        />
      </Line>
      <IconContainer data-type="large">
        <IcoFootprint40 />
      </IconContainer>
      <Line>
        <Spark
          initial={{
            x: 0,
            opacity: 0,
          }}
          animate={{
            x: 26,
            opacity: [0, 1, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              repeatDelay: 4,
            },
          }}
        />
      </Line>
      <IconContainer data-type="small">
        <IcoCheck16 />
      </IconContainer>
      <Line>
        <Spark
          initial={{
            x: 0,
            opacity: 0,
          }}
          animate={{
            x: 26,
            opacity: [0, 1, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            },
          }}
        />
      </Line>
      <IconContainer data-type="medium">
        <IcoDatabase24 />
      </IconContainer>
    </IconsContainer>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    gap: ${theme.spacing[2]};

    &::after {
      content: '';
      position: absolute;
      width: 130%;
      height: 100%;
      background-blend-mode: multiply;
      background: radial-gradient(
          60% 80% at 30% 38%,
          #def8ff 0%,
          transparent 50%
        ),
        radial-gradient(50% 80% at 70% 30%, #f3cfff 0%, transparent 60%),
        radial-gradient(50% 80% at 40% 50%, #e8eaff 0%, transparent 57%),
        radial-gradient(60% 80% at 80% 58%, #daf7ff 0%, transparent 50%);
    }
  `}
`;

const IconsContainer = styled.div`
  ${({ theme }) => css`
    user-select: none;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: ${theme.borderRadius.full};
    display: flex;
    align-items: center;
    justify-content: center;

    &[data-type='small'] {
      width: 24px;
      height: 24px;
    }

    &[data-type='medium'] {
      width: 56px;
      height: 56px;
    }

    &[data-type='large'] {
      width: 80px;
      height: 80px;
      background-color: ${theme.backgroundColor.primary};
      z-index: 1;
    }
  `}
`;

const Line = styled.div`
  height: 1.5px;
  width: 26px;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;

  &[data-type='long'] {
    width: 26px;

    ${media.greaterThan('sm')`
      width: 78px;
    `}
  }
`;

const Spark = styled(motion.div)`
  ${({ theme }) => css`
    position: relative;
    height: 6px;
    width: 6px;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.full};
    
    ::before {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      top: -4px;
      left: -2px;
      opacity: 0.5;
      background-color: ${theme.backgroundColor.primary};
      border-radius: ${theme.borderRadius.full};
      filter: blur(2px);
  `}
`;
export default SaveMoney;
