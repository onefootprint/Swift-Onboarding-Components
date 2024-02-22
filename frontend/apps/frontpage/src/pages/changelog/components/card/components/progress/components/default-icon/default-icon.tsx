import React from 'react';
import styled, { css } from 'styled-components';

import Circle from '../circle';

const DefaultIcon = () => (
  <Container>
    <Circle circleHeight={6} circleWidth={6} />
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    height: ${theme.spacing[7]};
    width: ${theme.spacing[7]};
    border-radius: ${theme.borderRadius.full};
    background: ${theme.backgroundColor.primary};

    svg {
      fill: ${theme.borderColor.tertiary};
    }
  `}
`;

export default DefaultIcon;
