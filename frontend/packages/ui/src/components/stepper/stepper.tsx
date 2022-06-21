import times from 'lodash/times';
import React from 'react';
import styled, { css } from 'styled-components';

export type StepperProps = {
  max: number;
  value: number;
};

const Stepper = ({ max, value = 0 }: StepperProps) => {
  const activeCount = Math.min(max, value);
  return (
    <StepperContainer
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={activeCount}
      role="progressbar"
    >
      {times(max).map(index => (
        <Step key={index} active={index < activeCount} />
      ))}
    </StepperContainer>
  );
};

const StepperContainer = styled.div`
  display: flex;
`;

const Step = styled.div<{
  active?: boolean;
}>`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.tertiary};
    border-radius: ${theme.borderRadius[4]}px;
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

export default Stepper;
