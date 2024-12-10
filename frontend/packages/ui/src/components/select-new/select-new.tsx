import * as Select from '@radix-ui/react-select';
import styled, { css } from 'styled-components';

import Label from '../label';
import Hint from './hint';
import Item from './item';
import type { SelectNewOption, SelectNewProps } from './select-new.types';
import Trigger from './trigger';

const SelectNew = ({
  ariaLabel = 'select',
  className,
  contentWidth = 'default',
  disabled = false,
  hint,
  label,
  onChange,
  options,
  placeholder = 'Select',
  size = 'default',
  value,
}: SelectNewProps & { className?: string }) => (
  <Select.Root onValueChange={onChange} disabled={disabled} value={value}>
    {label && <Label>{label}</Label>}
    <Trigger
      placeholder={placeholder}
      size={size}
      disabled={disabled}
      ariaLabel={ariaLabel}
      value={value}
      className={className}
    />
    {hint && <Hint text={hint} />}
    <StyledContent sideOffset={8} width={contentWidth} position="popper">
      <Select.Viewport className="max-h-50vh overflow-y-auto">
        {options.map((option: SelectNewOption, index: number) => (
          <Item
            key={option.value}
            option={option}
            size={size}
            isLast={index === options.length - 1}
            isFirst={index === 0}
          />
        ))}
      </Select.Viewport>
    </StyledContent>
  </Select.Root>
);

const StyledContent = styled(Select.Content)<{
  width?: string;
}>`
  ${({ width, theme }) => css`
    border-radius: ${theme.borderRadius.default};
    background-color: ${theme.backgroundColor.primary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    box-shadow: ${theme.elevation[3]};
    width: ${width};
    z-index: 1;
    padding: 0 ${theme.spacing[2]} 0 ${theme.spacing[2]};
  `}
`;

export default SelectNew;
