/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import isPlainObject from 'lodash/isPlainObject';
import type { FormHTMLAttributes } from 'react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import type { Di } from '../../../@types';

export type FormProps = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> & {
  children: React.ReactNode;
  onSubmit: (values: Di) => void;
};

const Form = ({ className, children, onSubmit, ...props }: FormProps) => {
  const methods = useForm<Di>();
  const { handleSubmit } = methods;

  const handleBeforeSubmit = (formValues: Di) => {
    onSubmit(flattenObject(formValues) as Di);
  };

  return (
    <FormProvider {...methods}>
      <form className={cx('fp-form', className)} {...props} onSubmit={handleSubmit(handleBeforeSubmit)}>
        {children}
      </form>
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
      const flatObject = flattenObject(obj[key] as Record<string, unknown>, newKey, sep);
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
