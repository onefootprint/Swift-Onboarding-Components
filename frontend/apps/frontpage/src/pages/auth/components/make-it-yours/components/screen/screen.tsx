import { Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import BifrostModals from '../desktop-banner/components/bifrost-modals';

const Screen = () => (
  <OuterContainer direction="column" className="screen">
    <Header direction="row" justify="start" align="center" gap={3} paddingLeft={4}>
      <Dot />
      <Dot />
      <Dot />
    </Header>
    <Content>
      <BifrostModals />
    </Content>
  </OuterContainer>
);

const OuterContainer = styled(Stack)`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default} ${theme.borderRadius.default} 0
      0;
    overflow: hidden;
    width: 100%;
  `}
`;

const Header = styled(Stack)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    height: 40px;
  `}
`;

const Dot = styled.span`
  ${({ theme }) => css`
    width: 8px;
    height: 8px;
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.senary};
  `}
`;

const Content = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 560px;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: url('/auth/hero/background.svg');
    background-size: 32px;
    background-position: center;
    background-repeat: repeat;
    mask: radial-gradient(
      100% 100% at 50% 100%,
      rgba(0, 0, 0, 0.1) 0%,
      transparent 100%
    );
    mask-mode: alpha;
    z-index: 0;
  }
`;
export default Screen;
