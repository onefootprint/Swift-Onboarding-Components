import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled';

export type ProgressIndicatorProps = {
  max: number;
  value: number;
};

const ProgressIndicator = ({ max, value = 0 }: ProgressIndicatorProps) => {
  const activeCount = Math.min(max, value);
  return (
    <Container
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={activeCount}
      role="progressbar"
    >
      {times(max).map(index => (
        <ProgressIndicatorStep key={index} active={index < activeCount} />
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
`;

const ProgressIndicatorStep = styled.div<{
  active?: boolean;
}>`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.tertiary};
    border-radius: ${theme.borderRadius[3]}px;
    width: 24px;
    height: 4px;

    &:not(:last-child) {
      margin-right: ${theme.spacing[2]}px;
    }
  `}

  ${({ active }) =>
    !active &&
    css`
      opacity: 0.1;
    `}
`;

export default ProgressIndicator;
