/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import Cleave from 'cleave.js';
import React, { useEffect } from 'react';

import useFieldProps from '../hooks/use-field-props';
import { useFootprint } from '../hooks/use-footprint';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = ({ className, id, ...props }: InputProps) => {
  const {
    form: { register },
  } = useFootprint();
  const { name, className: baseClassName, mask, validations, ...allProps } = useFieldProps();

  useEffect(() => {
    let cleaveInstance: Cleave | null = null;
    if (mask) cleaveInstance = new Cleave(`.${baseClassName}`, mask);
    return () => {
      if (cleaveInstance) cleaveInstance.destroy();
    };
  });

  return (
    <input
      {...allProps}
      {...props}
      className={cx('fp-input', baseClassName, className)}
      {...register(name, validations)}
    />
  );
};

export default Input;
