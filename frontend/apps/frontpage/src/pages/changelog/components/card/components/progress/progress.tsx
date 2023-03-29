import { media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import ActiveIcon from './components/active-icon';
import DefaultIcon from './components/default-icon';

type ProgressProps = {
  active?: boolean | false;
  showLine?: boolean;
};

const Progress = ({ active, showLine }: ProgressProps) => (
  <Container>
    <IconContainer>{active ? <ActiveIcon /> : <DefaultIcon />}</IconContainer>
    {showLine && <Line />}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;
    margin: 0 ${theme.spacing[7]};

    ${media.greaterThan('md')`
      display: flex;
      text-align: right;
    `}
  `}
`;

const Line = styled.div`
  ${({ theme }) => css`
    width: ${theme.borderWidth[1]};
    background: ${theme.borderColor.tertiary};
    height: 100%;
  `}
`;

const IconContainer = styled.div`
  flex: 0;
  top: 0;
  z-index: 1;
`;

export default Progress;
