import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { TextInputProps, TextInput } from 'react-native';
import { TextInput as RNTextInput } from 'react-native';
import { formatWithMask } from 'react-native-mask-input';
import useFieldProps from '../hooks/use-field-props';

export type InputProps = TextInputProps & {
  as?: React.ComponentType<TextInputProps & { hasError?: boolean }>;
  hasError?: boolean;
};

const Input = ({ as: Component = RNTextInput, hasError, ...props }: InputProps) => {
  const { control } = useFormContext();
  const { name, validations = {}, transformValue, mask, ...allProps } = useFieldProps();

  return (
    <Controller
      control={control}
      rules={validations}
      render={({ field: { onChange, onBlur, value }, fieldState }) => {
        return (
          <Component
            onBlur={event => {
              onBlur();
              props.onBlur?.(event);
            }}
            onChangeText={(val: string) => {
              let formattedValue = val;
              if (mask) {
                const { masked } = formatWithMask({ text: val, mask });
                formattedValue = masked;
              }
              if (transformValue) {
                const transformedValue = transformValue(formattedValue);
                onChange(transformedValue);
                props.onChangeText?.(transformedValue.toString());
                return;
              }
              onChange(formattedValue);
              props.onChangeText?.(formattedValue);
            }}
            value={value}
            hasError={hasError || !!fieldState.error}
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
