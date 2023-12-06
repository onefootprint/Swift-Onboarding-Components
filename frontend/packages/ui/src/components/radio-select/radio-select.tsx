import styled from '@onefootprint/styled';
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
      if ('groupTitle' in option) {
        return (
          <Stack key={option.groupTitle} direction="column" gap={3}>
            <Stack direction="row" gap={2} marginTop={3} marginBottom={1}>
              <Typography
                variant={size === 'compact' ? 'label-3' : 'label-2'}
                color="primary"
              >
                {option.groupTitle}
              </Typography>
            </Stack>
            {option.options.map(subOption => (
              <RadioSelectOption
                key={subOption.value}
                value={subOption.value}
                title={subOption.title}
                description={subOption.description}
                IconComponent={subOption.IconComponent}
                disabled={subOption.disabled}
                disabledHint={subOption.disabledHint}
                onClick={() => {
                  onChange?.(subOption.value);
                }}
                selected={subOption.value === value}
                size={size}
              />
            ))}
          </Stack>
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
          onClick={() => {
            onChange?.(option.value);
          }}
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

export default RadioSelect;
