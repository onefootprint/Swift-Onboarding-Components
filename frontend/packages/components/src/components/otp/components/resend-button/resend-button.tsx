/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { ButtonHTMLAttributes } from 'react';
import React from 'react';

export type OtpResendButtonProps = {
  isLoading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const ResendButton = ({
  children,
  className,
  isLoading,
  ...props
}: OtpResendButtonProps) => (
  <button
    {...props}
    className={cx('fp-otp-resend', className)}
    type="button"
    aria-busy={isLoading ? 'true' : 'false'}
    aria-disabled={isLoading ? 'true' : 'false'}
    disabled={isLoading}
  >
    {children}
  </button>
);

export default ResendButton;
