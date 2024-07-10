/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import isPlainObject from 'lodash/isPlainObject';
import type { FormHTMLAttributes } from 'react';
import React from 'react';
import { FieldErrors, FormProvider, useForm } from 'react-hook-form';

import type { Di } from '../../../@types';

type DiKey = keyof Di;

type FormOptions = {
  setValue: (name: DiKey, value: Di[DiKey]) => void;
  errors: FieldErrors<Di>;
};

export type FormProps = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> & {
  children: React.ReactNode | ((options: FormOptions) => React.ReactNode);
  onSubmit: (values: Di) => void;
  defaultValues?: Di;
};

const Form = ({ className, children, defaultValues, onSubmit, ...props }: FormProps) => {
  const methods = useForm<Di>({ defaultValues });
  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = methods;

  const handleBeforeSubmit = (formValues: Di) => {
    onSubmit(flattenObject(formValues) as Di);
  };

  return (
    <FormProvider {...methods}>
      <form className={cx('fp-form', className)} {...props} onSubmit={handleSubmit(handleBeforeSubmit)}>
        {typeof children === 'function'
          ? children({
              setValue: (name, value) => setValue(name, value as never), // TODO: Fix this type casting - issue with react-form-hook
              errors,
            })
          : children}
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
