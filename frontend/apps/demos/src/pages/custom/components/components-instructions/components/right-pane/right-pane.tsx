import { Button, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type RightPaneProps = {
  onLaunch: () => void;
};

const RightPane = ({ onLaunch }: RightPaneProps) => (
  <Right>
    <DesktopButtonContainer>
      <Button onClick={onLaunch}>Submit Payment</Button>
    </DesktopButtonContainer>
  </Right>
);

const Right = styled.div`
  display: flex;
  flex: 1;
  justify-content: center;
  min-width: 200px;
  height: 100%;

  ${media.lessThan('md')`
    display: none;
  `}
`;

const DesktopButtonContainer = styled.div`
  ${({ theme }) => css`
    position: fixed;
    top: calc(50% - ${theme.spacing[5]});
    white-space: nowrap;
  `}
`;

export default RightPane;
