import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type CountdownTimerProps = {
  current: number;
  start: number;
};

const CountdownTimer = ({ current, start }: CountdownTimerProps) => {
  if (start < current || current < 0 || start <= 0) return null;
  const fullAngle = 360;
  const progress = start - current;
  const angleInterval = fullAngle / start;
  const remainingAngle = fullAngle - angleInterval * progress;

  return (
    <Container>
      <Progress angle={remainingAngle}>
        <Typography variant="label-2" color="quinary">
          {current}
        </Typography>
      </Progress>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${theme.spacing[9]};
    height: ${theme.spacing[9]};
    border-radius: ${theme.borderRadius.full};
    background-color: #00000059;
  `}
`;

const Progress = styled.div<{ angle: number }>`
  ${({ theme, angle }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${theme.spacing[9]};
    height: ${theme.spacing[9]};
    border-radius: ${theme.borderRadius.full};
    background: conic-gradient(
      ${theme.backgroundColor.transparent} ${`${angle}deg`},
      #ffffff29 ${`${angle}deg`}
    );
  `}
`;

export default CountdownTimer;
