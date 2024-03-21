/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { HTMLAttributes } from 'react';
import React from 'react';

export type OtpTitleProps = HTMLAttributes<HTMLDivElement>;

const Title = ({ children, className, ...props }: OtpTitleProps) => (
  <div {...props} className={cx('fp-otp-title', className)}>
    {children}
  </div>
);

export default Title;
