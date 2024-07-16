import get from 'lodash/get';
import React, { useContext } from 'react';
import { useFormContext } from 'react-hook-form';
import type { TextProps } from 'react-native';
import { Text } from 'react-native';

import fieldContext from '../field-context';

export type FieldErrorsProps = TextProps;

const FieldErrors = ({ ...props }: FieldErrorsProps) => {
  const { name } = useContext(fieldContext);
  const {
    formState: { errors },
  } = useFormContext();

  if (!name) {
    throw new Error('FieldErrors must be used inside a Field component');
  }
  const error = get(errors, name);

  return error?.message ? <Text {...props}>{error?.message.toString()}</Text> : null;
};

export default FieldErrors;
