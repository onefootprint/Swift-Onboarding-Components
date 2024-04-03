import cx from 'classnames';
import Cleave from 'cleave.js';
import type { CleaveOptions } from 'cleave.js/options';
import get from 'lodash/get';
import kebabCase from 'lodash/kebabCase';
import React, { useEffect } from 'react';

import { useFootprint } from '../../hooks/use-footprint';
import type { InputProps } from '../internal/input';
import Input from '../internal/input';

export type CustomInputProps = Omit<InputProps, 'label' | 'placeholder'> & {
  identifier: string;
  label: string;
  mask?: CleaveOptions;
  placeholder?: string;
  validations?: {
    required?: string;
    validate?: (value: string) => string | boolean;
  };
};

const CustomInput = ({
  className,
  identifier,
  label,
  mask,
  validations = {},
  ...props
}: CustomInputProps) => {
  const elClassName = kebabCase(`fp-${identifier}-input`);
  const {
    form: {
      register,
      formState: { errors },
    },
  } = useFootprint();
  const error = get(errors, identifier);

  useEffect(() => {
    if (!mask) return () => {};
    const cleave = new Cleave(`.${elClassName}`, mask);
    return () => cleave.destroy();
  });

  return (
    <Input
      className={cx(elClassName, className)}
      hasError={!!error}
      label={label}
      message={error?.message}
      {...props}
      {...register(identifier, validations)}
      name={identifier || props.name}
    />
  );
};

export default CustomInput;
