import { primitives } from '@onefootprint/design-tokens';
import { IcoDatabase24, IcoLock24, IcoShield24 } from '@onefootprint/icons';
import { Stack } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import IllustrationContainer from '../../illustration-container';

const SecureEnclaves = () => (
  <IllustrationContainer isDark>
    <Spider src="/auth/sections/spider-01.svg" height={300} width={400} alt="decorative" position="right" />
    <Spider src="/auth/sections/spider-02.svg" height={300} width={400} alt="decorative" position="left" />
    <Icons justify="center" position="absolute" gap={8}>
      <IconContainer size="small" position="left">
        <IcoLock24 />
      </IconContainer>
      <IconContainer size="large" position="center">
        <IcoDatabase24 />
      </IconContainer>
      <IconContainer size="small" position="right">
        <IcoShield24 />
      </IconContainer>
    </Icons>
  </IllustrationContainer>
);

const Icons = styled(Stack)`
  position: absolute;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
  width: 100%;
  height: fit-content;
`;

const IconContainer = styled.div<{
  size: 'small' | 'large';
  position: 'left' | 'center' | 'right';
}>`
  ${({ theme, size, position }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    transform: scale(${size === 'large' ? 3 : 2});
    z-index: ${position === 'center' ? 4 : 3};
    border-radius: ${theme.borderRadius.full};
    background-color: ${position === 'center' ? '#090909' : primitives.Gray1000};
    box-shadow: ${
      position === 'center' ? '0px 0px 8px rgba(100, 100, 100, 0.1)' : '0px 0px 32px rgba(255, 255, 255, 0.11)'
    };
    filter: drop-shadow(0px 0px 32px rgba(255, 255, 255, 0.18))
      drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.08));

    svg {
      path {
        fill: ${position === 'center' ? primitives.Gray100 : primitives.Gray200};
      }
    }
  `}
`;

const Spider = styled(Image)<{ position: 'left' | 'right' }>`
  ${({ theme, position }) => css`
    position: absolute;
    ${position}: -10%;
    top: ${position === 'left' ? '60%' : '40%'};
    transform: translateY(-50%) scale(0.9);
    z-index: 0;
    border-radius: ${theme.borderRadius.full};
  `}
`;

export default SecureEnclaves;
