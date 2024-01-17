import styled, { css } from '@onefootprint/styled';
import noop from 'lodash/noop';
import React from 'react';

import Stack from '../stack';
import Typography from '../typography';
import type {
  GroupedRadioSelectOptionFields,
  RadioSelectOptionFields,
} from './components/radio-select-option';
import RadioSelectOption from './components/radio-select-option';

export type RadioSelectProps = {
  options: RadioSelectOptionFields[] | GroupedRadioSelectOptionFields[];
  value?: string;
  onChange?: (value: string) => void;
  testID?: string;
  size?: 'compact' | 'default';
};

const RadioSelect = ({
  options,
  value,
  onChange,
  testID,
  size,
}: RadioSelectProps) => (
  <OptionsContainer data-testid={testID} direction="column" gap={3}>
    {options.map(option => {
      if ('label' in option) {
        return (
          <GroupContainer key={option.label} direction="column" gap={4}>
            <Typography
              variant={size === 'compact' ? 'label-3' : 'label-2'}
              color="secondary"
            >
              {option.label}
            </Typography>
            {option.options.map(subOption => (
              <RadioSelectOption
                key={subOption.value}
                value={subOption.value}
                title={subOption.title}
                description={subOption.description}
                IconComponent={subOption.IconComponent}
                disabled={subOption.disabled}
                disabledHint={subOption.disabledHint}
                onClick={
                  subOption.disabled ? noop : () => onChange?.(subOption.value)
                }
                selected={subOption.value === value}
                size={size}
              />
            ))}
          </GroupContainer>
        );
      }
      return (
        <RadioSelectOption
          key={option.value}
          value={option.value}
          title={option.title}
          description={option.description}
          IconComponent={option.IconComponent}
          disabled={option.disabled}
          disabledHint={option.disabledHint}
          onClick={option.disabled ? noop : () => onChange?.(option.value)}
          selected={option.value === value}
          size={size}
        />
      );
    })}
  </OptionsContainer>
);

const OptionsContainer = styled(Stack)`
  span {
    width: 100%;
  }
`;

const GroupContainer = styled(Stack)`
  ${({ theme }) => css`
    &:not(:first-child) {
      margin-top: ${theme.spacing[5]};
    }
  `};
`;
export default RadioSelect;
