import { Stack } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const Marker = () => (
  <Container position="absolute">
    <Wave diameter="160px" />
    <Wave diameter="80px" />
    <Dot diameter="12px" />
  </Container>
);

const Container = styled(Stack)`
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
  width: 100%;
  height: 100%;
`;

const Wave = styled.div<{ diameter: string }>`
  ${({ theme, diameter }) => css`
    width: ${diameter};
    height: ${diameter};
    border-radius: 50%;
    background-color: ${theme.backgroundColor.tertiary};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.1;
  `}
`;

const Dot = styled.div<{ diameter: string }>`
  ${({ theme, diameter }) => css`
    width: ${diameter};
    height: ${diameter};
    border-radius: 50%;
    background-color: ${theme.color.primary};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `}
`;

export default Marker;
