import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import React from 'react';

export type StepperProps = {
  value: number;
  max: number;
};

const Stepper = ({ value, max }: StepperProps) => {
  const times = [...Array(max).keys()];

  return (
    <Box padding={2} gap={2} display="flex" flexDirection="row">
      {times.map(i => (
        <Dot key={i} selected={i === value} />
      ))}
    </Box>
  );
};

const Dot = styled.View<{ selected: boolean }>`
  ${({ theme, selected }) => css`
    background-color: ${theme.backgroundColor[
      selected ? 'tertiary' : 'senary'
    ]};
    border-radius: ${theme.spacing[2]};
    width: 8px;
    height: 8px;
  `}
`;

export default Stepper;
