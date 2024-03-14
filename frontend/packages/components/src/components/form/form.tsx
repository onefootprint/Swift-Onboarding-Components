import React from 'react';
import { useFormContext } from 'react-hook-form';

import type { UserData } from '../../types';

export type FormProps = {
  children: React.ReactNode;
  onSubmit: (data: UserData) => void;
};

const Form = ({ children, onSubmit }: FormProps) => {
  const { handleSubmit } = useFormContext<UserData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>{children}</div>
    </form>
  );
};

export default Form;
