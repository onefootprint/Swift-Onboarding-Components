import * as Select from '@radix-ui/react-select';
import React from 'react';
import styled, { css } from 'styled-components';

import Label from '../label';
import Hint from './hint';
import Item from './item';
import type { SelectNewOption, SelectNewProps } from './select-new.types';
import Trigger from './trigger/trigger';

const SelectNew = ({
  size = 'default',
  disabled = false,
  placeholder = 'Select',
  triggerWidth = 'default',
  contentWidth = 'default',
  label,
  hint,
  onChange,
  options,
  ariaLabel = 'select',
  value,
  className,
}: SelectNewProps & { className?: string }) => (
  <StyledRoot onValueChange={onChange} disabled={disabled} value={value}>
    {label && <Label>{label}</Label>}
    <Trigger
      placeholder={placeholder}
      size={size}
      disabled={disabled}
      triggerWidth={triggerWidth}
      ariaLabel={ariaLabel}
      value={value}
      className={className}
    />
    {hint && <Hint text={hint} />}
    <StyledContent sideOffset={8} width={contentWidth} position="popper">
      <Select.Viewport>
        {options.map((option: SelectNewOption) => (
          <Item key={option.value} option={option} size={size} />
        ))}
      </Select.Viewport>
    </StyledContent>
  </StyledRoot>
);

const StyledRoot = styled(Select.Root)`
  position: relative;
`;

const StyledContent = styled(Select.Content)<{
  width?: string;
}>`
  ${({ width, theme }) => css`
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    padding: ${theme.spacing[2]};
    width: ${width};
    z-index: 1;
  `}
`;

export default SelectNew;
