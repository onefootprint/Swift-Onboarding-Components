/* eslint-disable react/jsx-props-no-spreading */
import isPlainObject from 'lodash/isPlainObject';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { Di } from '../types/dis';

export type FormProps = {
  children: (onSubmit: () => void) => React.ReactNode;
  onSubmit: (values: Di) => void;
  defaultValues?: Di;
};

const Form = ({ children, defaultValues, onSubmit }: FormProps) => {
  const methods = useForm<Di>({ defaultValues });
  const { handleSubmit } = methods;

  const handleBeforeSubmit = (formValues: Di) => {
    onSubmit(flattenObject(formValues) as Di);
  };

  return (
    <FormProvider {...methods}>
      {children(handleSubmit(handleBeforeSubmit))}
    </FormProvider>
  );
};

const flattenObject = (
  obj: Record<string, unknown>,
  parentKey: string = '',
  sep: string = '.',
): Record<string, unknown> => {
  const toReturn: Record<string, unknown> = {};

  Object.keys(obj).forEach(key => {
    const newKey = parentKey ? `${parentKey}${sep}${key}` : key;
    if (isPlainObject(obj[key])) {
      const flatObject = flattenObject(
        obj[key] as Record<string, unknown>,
        newKey,
        sep,
      );
      Object.keys(flatObject).forEach(x => {
        toReturn[x] = flatObject[x] as Di;
      });
    } else {
      toReturn[newKey] = obj[key] as Di;
    }
  });

  return toReturn;
};

export default Form;
