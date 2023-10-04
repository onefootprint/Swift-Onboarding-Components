import styled from '@onefootprint/styled';
import React from 'react';

import Stack from '../stack';
import type { RadioSelectOptionFields } from './components/radio-select-option';
import RadioSelectOption from './components/radio-select-option';

export type RadioSelectProps = {
  options: RadioSelectOptionFields[];
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
}: RadioSelectProps) =>
  options.length > 0 ? (
    <OptionsContainer testID={testID} direction="column" gap={3}>
      {options.map(
        ({
          title,
          description,
          IconComponent,
          value: optionValue,
          disabled,
          disabledHint,
        }) => (
          <RadioSelectOption
            key={optionValue}
            value={optionValue}
            title={title}
            description={description}
            IconComponent={IconComponent}
            disabled={disabled}
            disabledHint={disabledHint}
            onClick={() => {
              onChange?.(optionValue);
            }}
            selected={optionValue === value}
            size={size}
          />
        ),
      )}
    </OptionsContainer>
  ) : null;

const OptionsContainer = styled(Stack)`
  span {
    width: 100%;
  }
`;

export default RadioSelect;
