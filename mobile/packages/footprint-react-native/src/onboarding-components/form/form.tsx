import React from 'react';
import type { FieldErrors } from 'react-hook-form';
import { FormProvider, useForm, type UseFormSetValue } from 'react-hook-form';

import type { FormValues } from '../../types';
import flattenObject from '../utils/flatten-object';

type FormOptions = {
  handleSubmit: () => void;
  setValue: UseFormSetValue<FormValues>;
  errors: FieldErrors<FormValues>;
};

export type FormProps = {
  children: (options: FormOptions) => React.ReactNode;
  onSubmit: (values: FormValues) => void;
  defaultValues?: FormValues;
};

const Form = ({ children, defaultValues, onSubmit }: FormProps) => {
  const methods = useForm<FormValues>({ defaultValues });
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const handleBeforeSubmit = (formValues: FormValues) => {
    onSubmit(flattenObject(formValues) as FormValues);
  };

  return (
    <FormProvider {...methods}>
      {children({
        handleSubmit: handleSubmit(handleBeforeSubmit),
        setValue, // TODO: Fix this type casting - issue with react-form-hook
        errors: flattenObject(errors, { level: 1 }) as FieldErrors<FormValues>,
      })}
    </FormProvider>
  );
};

export default Form;
