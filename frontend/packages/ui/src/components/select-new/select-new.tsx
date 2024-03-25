import * as Select from '@radix-ui/react-select';
import React from 'react';
import styled, { css } from 'styled-components';

import Label from '../label';
import Hint from './hint';
import Item from './item';
import type { ContentProps, SelectNewProps } from './select-new.types';
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
}: SelectNewProps) => (
  <StyledRoot onValueChange={onChange} disabled={disabled}>
    {label && <Label>{label}</Label>}
    <Trigger
      placeholder={placeholder}
      size={size}
      disabled={disabled}
      triggerWidth={triggerWidth}
      ariaLabel={ariaLabel}
    />
    {hint && <Hint text={hint} />}
    <Select.Portal>
      <StyledContent sideOffset={8} width={contentWidth} position="popper">
        <Select.Viewport>
          {options.map(option => (
            <Item key={option.value} option={option} size={size} />
          ))}
        </Select.Viewport>
      </StyledContent>
    </Select.Portal>
  </StyledRoot>
);

const StyledRoot = styled(Select.Root)`
  position: relative;
`;

const StyledContent = styled(Select.Content)<{
  width?: ContentProps['contentWidth'];
}>`
  ${({ width, theme }) => css`
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    padding: ${theme.spacing[2]};
    z-index: ${theme.zIndex.dialog + 1};

    ${width === 'full' &&
    css`
      width: 100%;
    `}

    ${width === 'auto' &&
    css`
      width: auto;
    `}

      ${width === 'narrow' &&
    css`
      width: 120px;
    `}

      ${width === 'default' &&
    css`
      width: 300px;
    `}

      ${width === 'wide' &&
    css`
      width: 320px;
    `}
  `}
`;

export default SelectNew;
