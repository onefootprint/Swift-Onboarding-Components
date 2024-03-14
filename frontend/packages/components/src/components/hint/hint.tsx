/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { HTMLAttributes } from 'react';
import React from 'react';

export type HintProps = HTMLAttributes<HTMLParagraphElement>;

const Hint = ({ className, ...props }: HintProps) => (
  <p className={cx('fp-hint', className)} {...props} />
);

export default Hint;
