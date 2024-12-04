import { OTPInput, OTPInputContext } from 'input-otp';
import * as React from 'react';

import { cx } from '../../utils/cn';

const InputOTP = React.forwardRef<React.ElementRef<typeof OTPInput>, React.ComponentPropsWithoutRef<typeof OTPInput>>(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      {...props}
      ref={ref}
      containerClassName={cx(
        'fp-flex fp-items-center fp-gap-2 fp-has-[:disabled]:fp-opacity-50 fp-pin-input-container',
        containerClassName,
      )}
      className={cx('fp-disabled:fp-cursor-not-allowed', className)}
    />
  ),
);
InputOTP.displayName = 'InputOTP';

const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number; activeClassName?: string; caretClassName?: string }
>(({ index, className, activeClassName, caretClassName, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      {...props}
      ref={ref}
      className={cx(
        'fp-relative fp-flex fp-h-10 fp-w-10 fp-items-center fp-justify-center fp-border fp-border-solid fp-rounded-sm fp-border-gray-600 fp-text-sm fp-transition-all1',
        'fp-input fp-pin-input',
        isActive && activeClassName,
        className,
      )}
    >
      {char}
      {hasFakeCaret && (
        <div className="fp-pointer-events-none fp-absolute fp-inset-0 fp-flex fp-items-center fp-justify-center">
          <div
            className={cx('fp-h-4 fp-w-px fp-animate-caret-blink fp-bg-gray-600 fp-duration-1000', caretClassName)}
          />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

export { InputOTP, InputOTPSlot };
