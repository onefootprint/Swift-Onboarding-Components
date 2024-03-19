/* eslint-disable react/jsx-props-no-spreading */
import type { FormHTMLAttributes } from 'react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { UserData } from '../../@types';

export type FormProps = FormHTMLAttributes<HTMLFormElement> & {
  children: React.ReactNode;
  onSubmit: (data: UserData) => void;
};

const Form = ({ children, onSubmit, ...props }: FormProps) => {
  const { handleSubmit } = useFormContext<UserData>();

  return (
    <form {...props} onSubmit={handleSubmit(onSubmit)}>
      {children}
    </form>
  );
};

export default Form;
