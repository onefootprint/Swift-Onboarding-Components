/* eslint-disable react/jsx-props-no-spreading */
import type { FormHTMLAttributes } from 'react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { UserData } from '../../@types';

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: React.ReactNode;
  onSubmit: () => void;
};

const Form = ({ children, onSubmit, ...props }: FormProps) => {
  const { handleSubmit } = useFormContext<UserData>();

  const handleBeforeSubmit = () => {
    onSubmit();
  };

  return (
    <form {...props} onSubmit={handleSubmit(handleBeforeSubmit)}>
      {children}
    </form>
  );
};

export default Form;
