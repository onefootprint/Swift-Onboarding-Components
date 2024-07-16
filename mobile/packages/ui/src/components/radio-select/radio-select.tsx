import React from 'react';

import type { BoxProps } from '../box';
import Box from '../box';
import Option from './components/radio-select-option';
import type { RadioSelectOption, StringOrNumber } from './radio-select.types';

export type RadioSelectProps<T extends StringOrNumber = string> = BoxProps & {
  onChange?: (value: T) => void;
  options: RadioSelectOption<T>[];
  value?: T;
};

const RadioSelect = <T extends StringOrNumber = string>({
  options,
  onChange,
  value,
  ...props
}: RadioSelectProps<T>) => {
  return options.length > 0 ? (
    <Box {...props} gap={3}>
      {options.map(({ title, IconComponent, value: optionValue }) => (
        <Option
          key={optionValue}
          value={optionValue}
          title={title}
          IconComponent={IconComponent}
          onPress={() => {
            onChange?.(optionValue);
          }}
          selected={optionValue === value}
        />
      ))}
    </Box>
  ) : null;
};

export default RadioSelect;
