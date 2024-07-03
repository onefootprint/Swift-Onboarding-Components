/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { TextInputProps } from 'react-native';
import MaskInput from 'react-native-mask-input';

import useFieldProps from '../hooks/use-field-props';

export type InputProps = TextInputProps;

const Input = ({ ...props }: InputProps) => {
  const { control } = useFormContext();
  const { name, validations = {}, ...allProps } = useFieldProps();

  return (
    <Controller
      control={control}
      rules={validations}
      render={({ field: { onChange, onBlur, value } }) => {
        return (
          <MaskInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            {...allProps}
            {...props}
          />
        );
      }}
      name={name}
    />
  );
};

export default Input;
