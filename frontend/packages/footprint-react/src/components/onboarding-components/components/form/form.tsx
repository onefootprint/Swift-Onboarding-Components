/* eslint-FormValuessable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { FormHTMLAttributes } from 'react';
import type React from 'react';
import { type FieldErrors, FormProvider, type UseFormSetFocus, type UseFormSetValue, useForm } from 'react-hook-form';

import type { FormValues } from '../../../../types';
import useFormTransforms from '../../hooks/use-form-transforms';
import flattenObject from '../../utils/flatten-object';

type FormOptions = {
  errors: FieldErrors<FormValues>;
  handleSubmit: () => void;
  setFocus: UseFormSetFocus<FormValues>;
  setValue: UseFormSetValue<FormValues>;
};

export type FormProps = Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children' | 'defaultValue'> & {
  children: React.ReactNode | ((options: FormOptions) => React.ReactNode);
  defaultValues?: FormValues;
  onSubmit: (values: FormValues) => void;
};

const Form = ({ className, children, defaultValues, onSubmit, ...props }: FormProps) => {
  const transform = useFormTransforms();
  const methods = useForm<FormValues>({ defaultValues: transform.input(defaultValues) });
  const {
    formState: { errors },
    handleSubmit,
    setFocus,
    setValue,
  } = methods;

  const handleBeforeSubmit = (formValues: FormValues) => {
    const flattenedValues = flattenObject(formValues) as FormValues;
    const transformedValues = transform.output(flattenedValues);
    onSubmit(transformedValues);
  };

  return (
    <FormProvider {...methods}>
      <form className={cx('fp-form', className)} {...props} onSubmit={handleSubmit(handleBeforeSubmit)}>
        {typeof children === 'function'
          ? children({
              errors: flattenObject(errors, { level: 1 }) as FieldErrors<FormValues>,
              handleSubmit: handleSubmit(handleBeforeSubmit),
              setFocus,
              setValue,
            })
          : children}
      </form>
    </FormProvider>
  );
};

export default Form;
