import * as Tabs from '@radix-ui/react-tabs';
import styled, { css } from 'styled-components';

import Text from '../../../text';
import type { SegmentedControlSize, SegmentedControlVariant } from '../../segmented-control';

export type SegmentedControlOptionFields<T extends string = string> = {
  value: T;
  label: string;
  size?: SegmentedControlSize;
  variant?: SegmentedControlVariant;
};

export type SegmentedControlOptionProps = SegmentedControlOptionFields & {
  selected?: boolean;
};

const SegmentedControlOption = ({
  value: optionValue,
  label,
  selected,
  size = 'default',
  variant = 'primary',
}: SegmentedControlOptionProps) => (
  // biome-ignore lint/a11y/useSemanticElements: TODO: change to type="button"
  <OptionTrigger
    role="button"
    value={optionValue}
    key={optionValue}
    data-selected={selected}
    size={size}
    variant={variant}
    tabIndex={0}
  >
    <Text variant={selected ? 'label-3' : 'body-3'}>{label}</Text>
  </OptionTrigger>
);

const OptionTrigger = styled(Tabs.Trigger)<{ size: SegmentedControlSize; variant: SegmentedControlVariant }>`
  ${({ theme, size, variant }) => css`
    border: none;
    border-radius: ${theme.borderRadius.full};
    padding: ${size === 'compact' ? `${theme.spacing[1]} ${theme.spacing[4]}` : `${theme.spacing[2]} ${theme.spacing[4]}`};
    display: flex;
    justify-content: center;
    align-items: center;
    &[data-state='active'] {
      background-color: ${theme.backgroundColor.primary};
      color: ${theme.color.primary};
      box-shadow: 0px 0px 2px rgba(0, 0, 0, 0.15);
    }

    &[data-state='inactive'] {
      cursor: pointer;
      background-color: ${variant === 'primary' ? theme.backgroundColor.secondary : theme.backgroundColor.senary};
      color: ${theme.color.tertiary};
      &:hover {
        background-color: ${variant === 'primary' ? 'rgba(14, 20, 56, 0.06)' : 'rgba(14, 20, 56, 0.1)'};
      }
    }


  `}
`;

export default SegmentedControlOption;
