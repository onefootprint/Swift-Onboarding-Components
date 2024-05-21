import cx from 'classnames';
import Cleave from 'cleave.js';
import type { CleaveOptions } from 'cleave.js/options';
import kebabCase from 'lodash/kebabCase';
import type { InputHTMLAttributes } from 'react';
import React, { useEffect } from 'react';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type CustomInputProps = InputHTMLAttributes<HTMLInputElement> & {
  identifier: `custom.${string}`;
  mask?: CleaveOptions;
  validations?: {
    required?: string;
    validate?: (value: string) => string | boolean;
  };
};

const CustomInput = ({
  className,
  identifier,
  mask,
  validations = {},
  ...props
}: CustomInputProps) => {
  const elClassName = kebabCase(`fp-${identifier}-input`);
  const {
    form: { register },
  } = useFootprint();

  useEffect(() => {
    if (!mask) return () => {};
    const cleave = new Cleave(`.${elClassName}`, mask);
    return () => cleave.destroy();
  });

  return (
    <input
      className={cx(elClassName, className)}
      {...props}
      {...register(identifier, validations)}
      name={identifier || props.name}
    />
  );
};

export default CustomInput;
