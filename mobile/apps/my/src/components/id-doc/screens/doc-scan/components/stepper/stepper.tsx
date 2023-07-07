import styled, { css } from '@onefootprint/styled';
import { Box } from '@onefootprint/ui';
import React from 'react';

type StepperProps = {
  value: number;
  max: number;
};

const Stepper = ({ value, max }: StepperProps) => {
  const times = [...Array(max).keys()];

  return (
    <Box padding={3}>
      {times.map(i => (
        <Dot key={i} selected={value <= max} />
      ))}
    </Box>
  );
};

const Dot = styled.View<{ selected: boolean }>`
  ${({ theme, selected }) => css`
    background-color: ${theme.backgroundColor[
      selected ? 'tertiary' : 'senary'
    ]};
    width: 8px;
    height: 8px;
  `}
`;

export default Stepper;
