import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { TextInputProps, TextInput } from 'react-native';
import MaskInput from 'react-native-mask-input';
import useFieldProps from '../hooks/use-field-props';

export type InputProps = TextInputProps & {
  as?: React.ComponentType<TextInputProps & { hasError?: boolean }>;
  hasError?: boolean;
};

const Input = ({ as: Component = MaskInputWrapper, hasError, ...props }: InputProps) => {
  const { control } = useFormContext();
  const { name, validations = {}, transformValue, ...allProps } = useFieldProps();

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
              if (transformValue) {
                const transformedValue = transformValue(val);
                onChange(transformedValue);
                props.onChangeText?.(transformedValue.toString());
                return;
              }
              onChange(val);
              props.onChangeText?.(val);
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

const MaskInputWrapper = React.forwardRef<TextInput, TextInputProps & { hasError?: boolean }>((props, ref) => {
  const { onChangeText, hasError, ...rest } = props;

  return (
    <MaskInput
      ref={ref}
      {...rest}
      onChangeText={masked => {
        if (onChangeText) {
          onChangeText(masked);
        }
      }}
    />
  );
});

export default Input;
