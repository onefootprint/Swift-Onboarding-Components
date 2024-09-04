/* eslint-FormValuessable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { FormHTMLAttributes } from 'react';
import type React from 'react';
import { type FieldErrors, FormProvider, type UseFormSetFocus, type UseFormSetValue, useForm } from 'react-hook-form';

import type { FormValues } from '../../../../types';
import flattenObject from '../../utils/flatten-object';

type FormOptions = {
  handleSubmit: () => void;
  setValue: UseFormSetValue<FormValues>;
  setFocus: UseFormSetFocus<FormValues>;
  errors: FieldErrors<FormValues>;
};

export type FormProps = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'> & {
  children: React.ReactNode | ((options: FormOptions) => React.ReactNode);
  onSubmit: (values: FormValues) => void;
  defaultValues?: FormValues;
};

const Form = ({ className, children, defaultValues, onSubmit, ...props }: FormProps) => {
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
      <form className={cx('fp-form', className)} {...props} onSubmit={handleSubmit(handleBeforeSubmit)}>
        {typeof children === 'function'
          ? children({
              handleSubmit: handleSubmit(handleBeforeSubmit),
              setValue,
              setFocus,
              errors: flattenObject(errors, { level: 1 }) as FieldErrors<FormValues>,
            })
          : children}
      </form>
    </FormProvider>
  );
};

export default Form;
