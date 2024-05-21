/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import kebabCase from 'lodash/kebabCase';
import type { SelectHTMLAttributes } from 'react';
import React from 'react';

import { useFootprint } from '../../../../../hooks/use-footprint';

export type CustomSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  identifier: `custom.${string}`;
  placeholder: string;
  validations: {
    required?: string;
    validate?: (value: string) => string | boolean;
  };
};

const CustomSelect = ({
  className,
  identifier,
  placeholder,
  validations,
  ...props
}: CustomSelectProps) => {
  const elClassName = kebabCase(`fp-${identifier}-input`);
  const {
    form: { register },
  } = useFootprint();

  return (
    <select
      className={cx(elClassName, className)}
      {...props}
      {...register(identifier, validations)}
      name={identifier || props.name}
    >
      <option value="">{placeholder}</option>
      {props.children}
    </select>
  );
};

export default CustomSelect;
