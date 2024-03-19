/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { HTMLAttributes } from 'react';
import React from 'react';

export type OtpProps = {
  onSuccess?: () => void;
  onError?: () => void;
  onResend?: () => void;
} & HTMLAttributes<HTMLDivElement>;

export type OtpTitleProps = HTMLAttributes<HTMLDivElement>;

const OtpTitle = ({ children, className, ...props }: OtpTitleProps) => (
  <div {...props} className={cx('fp-otp-title', className)}>
    {children}
  </div>
);

const Otp = ({
  onSuccess,
  onError,
  onResend,
  className,
  ...props
}: OtpProps) => (
  <div {...props} className={cx('fp-otp-title', className)}>
    {children}
  </div>
);

export default Otp;
