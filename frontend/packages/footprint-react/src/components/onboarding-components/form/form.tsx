/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { FormHTMLAttributes } from 'react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { Di } from '../../../@types';

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: React.ReactNode;
  onSubmit: () => void;
};

const Form = ({ className, children, onSubmit, ...props }: FormProps) => {
  const { handleSubmit } = useFormContext<Di>();

  const handleBeforeSubmit = () => {
    onSubmit();
  };

  return (
    <form className={cx('fp-form', className)} {...props} onSubmit={handleSubmit(handleBeforeSubmit)}>
      {children}
    </form>
  );
};

export default Form;
