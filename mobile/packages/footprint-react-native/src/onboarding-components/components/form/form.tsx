import React from 'react';
import type { FieldErrors } from 'react-hook-form';
import { FormProvider, type UseFormSetFocus, type UseFormSetValue, useForm } from 'react-hook-form';
import { StyleSheet, View, type ViewProps, ViewStyle } from 'react-native';

import type { FormValues } from '../../../types';
import flattenObject from '../../utils/flatten-object';

type FormOptions = {
  handleSubmit: () => void;
  setValue: UseFormSetValue<FormValues>;
  setFocus: UseFormSetFocus<FormValues>;
  errors: FieldErrors<FormValues>;
};

export type FormProps = {
  children: (options: FormOptions) => React.ReactNode;
  onSubmit: (values: FormValues) => void;
  defaultValues?: FormValues;
  style?: ViewStyle;
} & Omit<ViewProps, 'children'>;

const Form = ({ children, defaultValues, onSubmit, style, ...props }: FormProps) => {
  const methods = useForm<FormValues>({ defaultValues });
  const {
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors },
  } = methods;

  const handleBeforeSubmit = (formValues: FormValues) => {
    onSubmit(flattenObject(formValues) as FormValues);
  };

  return (
    <FormProvider {...methods}>
      <View {...props} style={[styles.container, style]}>
        {children({
          handleSubmit: handleSubmit(handleBeforeSubmit),
          setValue,
          setFocus,
          errors: flattenObject(errors, { level: 1 }) as FieldErrors<FormValues>,
        })}
      </View>
    </FormProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default Form;
