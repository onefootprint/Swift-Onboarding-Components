/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { LabelHTMLAttributes } from 'react';
import React, { useContext } from 'react';

import fieldContext from '../field-context';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

const Label = ({ className, children, htmlFor, ...props }: LabelProps) => {
  const { id } = useContext(fieldContext);
  if (!id) {
    throw new Error('Label must be used inside a Field component');
  }

  return (
    <label
      htmlFor={htmlFor || id}
      className={cx('fp-label', className)}
      {...props}
    >
      {children}
    </label>
  );
};

export default Label;
