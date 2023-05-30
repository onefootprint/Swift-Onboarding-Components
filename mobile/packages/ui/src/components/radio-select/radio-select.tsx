/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';

import { Box, BoxProps } from '../box';
import Option from './components/option';
import type { RadioSelectOption } from './radio-select.types';

export type RadioSelectProps = BoxProps & {
  onChange?: (value: string) => void;
  options: RadioSelectOption[];
  value?: string;
};

const RadioSelect = ({
  options,
  onChange,
  value,
  ...props
}: RadioSelectProps) => {
  return options.length > 0 ? (
    <Box {...props} gap={3}>
      {options.map(
        ({ title, description, IconComponent, value: optionValue }) => (
          <Option
            key={optionValue}
            value={optionValue}
            title={title}
            description={description}
            IconComponent={IconComponent}
            onPress={() => {
              onChange?.(optionValue);
            }}
            selected={optionValue === value}
          />
        ),
      )}
    </Box>
  ) : null;
};

export default RadioSelect;
