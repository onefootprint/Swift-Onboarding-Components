/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { LabelHTMLAttributes } from 'react';
import React from 'react';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  htmlFor: string;
};

const Label = ({ className, htmlFor, children, ...props }: LabelProps) => (
  <label className={cx('fp-label', className)} {...props} htmlFor={htmlFor}>
    {children}
  </label>
);

export default Label;
