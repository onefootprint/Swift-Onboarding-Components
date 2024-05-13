/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { HTMLAttributes } from 'react';
import React from 'react';

export type HintProps = {
  hasError?: boolean;
} & HTMLAttributes<HTMLParagraphElement>;

const Hint = ({ className, hasError, ...props }: HintProps) => (
  <p
    className={cx('fp-message', className)}
    aria-invalid={hasError ? 'true' : 'false'}
    {...props}
  />
);

export default Hint;
