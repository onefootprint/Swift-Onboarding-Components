/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import get from 'lodash/get';
import type { HTMLAttributes } from 'react';
import React, { useContext } from 'react';

import { useFormContext } from 'react-hook-form';
import fieldContext from '../field-context';

export type FieldErrorsProps = HTMLAttributes<HTMLDivElement>;

const FieldErrors = ({ className, ...props }: FieldErrorsProps) => {
  const { name } = useContext(fieldContext);
  const {
    formState: { errors },
  } = useFormContext();

  if (!name) {
    throw new Error('FieldErrors must be used inside a Field component');
  }
  const error = get(errors, name);

  return error?.message ? (
    <div className={cx('fp-field-errors', className)} {...props}>
      {error?.message.toString()}
    </div>
  ) : null;
};

export default FieldErrors;
