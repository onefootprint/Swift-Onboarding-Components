import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type CountdownTimerProps = {
  current: number;
  start: number;
};

const COUNTDOWN_TIMER_SIZE = 76;

const CountdownTimer = ({ current, start }: CountdownTimerProps) => {
  if (start < current || current <= 0 || start <= 0) return null;

  return (
    <Container size={COUNTDOWN_TIMER_SIZE}>
      <Typography variant="display-2" color="quinary">
        {current}
      </Typography>
    </Container>
  );
};

const Container = styled.div<{ size: number }>`
  ${({ theme, size }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${size}px;
    height: ${size}px;
    border-radius: ${theme.borderRadius.full};
    background-color: #00000059;
  `}
`;

export default CountdownTimer;
