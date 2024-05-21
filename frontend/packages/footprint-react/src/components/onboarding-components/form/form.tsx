/* eslint-disable react/jsx-props-no-spreading */
import type { FootprintUserData } from '@onefootprint/footprint-js';
import cx from 'classnames';
import type { FormHTMLAttributes } from 'react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: React.ReactNode;
  onSubmit: () => void;
};

const Form = ({ className, children, onSubmit, ...props }: FormProps) => {
  const { handleSubmit } = useFormContext<FootprintUserData>();

  const handleBeforeSubmit = () => {
    onSubmit();
  };

  return (
    <form
      className={cx('fp-form', className)}
      {...props}
      onSubmit={handleSubmit(handleBeforeSubmit)}
    >
      {children}
    </form>
  );
};

export default Form;
