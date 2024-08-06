import * as Tabs from '@radix-ui/react-tabs';
import styled, { css } from 'styled-components';

import type { SegmentedControlOptionFields } from './components/segmented-control-option';
import SegmentedControlOption from './components/segmented-control-option';

export type SegmentedControlProps = {
  'aria-label': string;
  options: SegmentedControlOptionFields[];
  value: string;
  onChange: (value: string) => void;
};

const SegmentedControl = ({ 'aria-label': ariaLabel, value, options, onChange }: SegmentedControlProps) => (
  <Tabs.Root value={value} onValueChange={onChange}>
    <OptionsContainer aria-label={ariaLabel}>
      {options.map(({ value: optionValue, label, IconComponent }) => (
        <SegmentedControlOption
          value={optionValue}
          label={label}
          IconComponent={IconComponent}
          key={optionValue}
          selected={optionValue === value}
        />
      ))}
    </OptionsContainer>
  </Tabs.Root>
);

const OptionsContainer = styled(Tabs.List)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    border-radius: ${theme.borderRadius.full};
    overflow: hidden;
    width: fit-content;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[2]};
    background-color: ${theme.backgroundColor.primary};
  `};
`;

export default SegmentedControl;
