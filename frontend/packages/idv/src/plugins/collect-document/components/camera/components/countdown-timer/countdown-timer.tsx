import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';
import { COUNTDOWN_TIMER_SIZE } from '../../../../constants';

type CountdownTimerProps = {
  current: number;
  start: number;
};

const CountdownTimer = ({ current, start }: CountdownTimerProps) => {
  if (start < current || current <= 0 || start <= 0) return null;

  return (
    <Container $size={COUNTDOWN_TIMER_SIZE}>
      <Text variant="display-2" color="quinary">
        {current}
      </Text>
    </Container>
  );
};

const Container = styled.div<{ $size: number }>`
  ${({ theme, $size }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${$size}px;
    height: ${$size}px;
    border-radius: ${theme.borderRadius.full};
    background-color: #00000059;
  `}
`;

export default CountdownTimer;
