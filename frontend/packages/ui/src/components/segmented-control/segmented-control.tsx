import * as Tabs from '@radix-ui/react-tabs';
import styled, { css } from 'styled-components';

import type { SegmentedControlOptionFields } from './components/segmented-control-option';
import SegmentedControlOption from './components/segmented-control-option';
export type SegmentedControlProps = {
  'aria-label': string;
  options: SegmentedControlOptionFields[];
  value: string;
  onChange: (value: string) => void;
  size?: SegmentedControlSize;
  variant?: SegmentedControlVariant;
};

export type SegmentedControlSize = 'compact' | 'default';
export type SegmentedControlVariant = 'primary' | 'secondary';

const SegmentedControl = ({
  'aria-label': ariaLabel,
  value,
  options,
  onChange,
  size = 'default',
  variant = 'primary',
}: SegmentedControlProps) => (
  <Tabs.Root value={value} onValueChange={onChange} activationMode="manual">
    <OptionsContainer aria-label={ariaLabel} size={size} variant={variant}>
      {options.map(({ value: optionValue, label }) => (
        <SegmentedControlOption
          size={size}
          value={optionValue}
          label={label}
          key={optionValue}
          selected={optionValue === value}
          variant={variant}
        />
      ))}
    </OptionsContainer>
  </Tabs.Root>
);

const OptionsContainer = styled(Tabs.List)<{ size: SegmentedControlSize; variant: SegmentedControlVariant }>`
  ${({ theme, variant }) => css`
    display: flex;
    flex-direction: row;
    border-radius: ${theme.borderRadius.full};
    overflow: hidden;
    width: fit-content;
    border: none;
    padding: ${theme.spacing[1]};
    gap: ${theme.spacing[1]};
    background-color: ${variant === 'primary' ? theme.backgroundColor.secondary : theme.backgroundColor.senary};
  `};
`;

export default SegmentedControl;
