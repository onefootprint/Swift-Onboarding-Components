/* eslint-disable react/jsx-props-no-spreading */
import styled, { css } from '@onefootprint/styled';
import * as React from 'react';

import { Box, BoxProps } from '../box';
import Option, { OptionFields } from './components/option';

export type SegmentedControlProps = BoxProps & {
  'aria-label': string;
  onChange?: (value: string) => void;
  options: OptionFields[];
  value: string;
};

const SegmentedControl = ({
  'aria-label': ariaLabel,
  onChange,
  options,
  value,
  ...props
}: SegmentedControlProps) => (
  <Box flexDirection="row" {...props}>
    <SegmentedControlContainer aria-label={ariaLabel}>
      {options.map(({ value: optionValue, label, IconComponent }) => (
        <Option
          IconComponent={IconComponent}
          key={optionValue}
          label={label}
          onPress={() => onChange?.(optionValue)}
          selected={optionValue === value}
          value={optionValue}
        />
      ))}
    </SegmentedControlContainer>
  </Box>
);

const SegmentedControlContainer = styled.View`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: row;
    height: 48px;
    overflow: hidden;
    padding: ${theme.spacing[2]};
  `};
`;

export default SegmentedControl;
