import { TextInput } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';

export type NameData = {
  name: string;
};

export type NameProps = {
  label?: string;
};

const Name = ({ label = 'Cardholder name' }: NameProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<NameData>();

  return (
    <TextInput
      data-private
      hasError={!!errors.name}
      hint={errors.name?.message}
      label={label}
      placeholder="Jane Doe"
      {...register('name', {
        required: {
          value: true,
          message: 'Name cannot be empty',
        },
      })}
    />
  );
};

export default Name;
