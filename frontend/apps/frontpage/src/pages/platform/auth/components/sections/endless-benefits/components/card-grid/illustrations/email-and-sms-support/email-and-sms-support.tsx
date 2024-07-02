import { Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import IllustrationContainer from '../illustration-container';
import ChatBubble from './components/chat-bubble';
import Mail from './components/mail';

const EmailAndSmsSupport = () => (
  <IllustrationContainer>
    <Background />
    <IconContainer type="chat" justify="center" align="center">
      <ChatBubble />
    </IconContainer>
    <IconContainer type="mail" justify="center" align="center">
      <Mail />
    </IconContainer>
  </IllustrationContainer>
);

const Background = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background-image: url('/auth/grid/circuit-board.svg');
  background-repeat: repeat;
  background-position: center;
  background-size: 220px;
  mask: radial-gradient(
    80% 80% at 50% 50%,
    rgba(0, 0, 0, 0.5) 10%,
    transparent 80%
  );
  mask-mode: alpha;
  z-index: 1;
`;

const IconContainer = styled(Stack)<{ type: 'chat' | 'mail' }>`
  ${({ theme, type }) => css`
    position: absolute;
    border-radius: 20px;
    background-color: ${theme.backgroundColor.tertiary};
    width: fit-content;
    padding: ${theme.spacing[4]};
    height: 90px;
    width: 90px;
    transform: translate(-50%, -50%)
      ${type === 'chat' ? 'rotate(-15deg)' : 'rotate(15deg)'};
    z-index: 3;
    top: 50%;
    left: ${type === 'chat' ? '35%' : '65%'};
    box-shadow:
      -4px 4px 5px 0px rgba(255, 255, 255, 0.17) inset,
      8px -4px 20px 0px rgba(0, 0, 0, 0.1) inset,
      0px 5px 12px 0px rgba(10, 5, 26, 0.16);
  `}
`;
export default EmailAndSmsSupport;
