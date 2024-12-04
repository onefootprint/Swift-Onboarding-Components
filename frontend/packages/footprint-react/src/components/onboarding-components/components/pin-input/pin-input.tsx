import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { INPUT_FIELDS_COUNT, pins } from '../pin-input/pin-input.constants';
import { InputOTP, InputOTPSlot } from './input-opt';

export type PinInputProps = {
  containerClassName?: string;
  pinClassName?: string;
  pinActiveClassName?: string;
  caretClassName?: string;
  onComplete: (value: string) => void;
  autoFocus?: boolean;
} & Omit<
  React.ComponentPropsWithoutRef<typeof InputOTP>,
  'maxLength' | 'pattern' | 'inputMode' | 'onComplete' | 'render'
>;

const PinInput = ({
  containerClassName,
  pinClassName,
  pinActiveClassName,
  caretClassName,
  onComplete,
  ...inputProps
}: PinInputProps) => {
  return (
    <InputOTP
      {...inputProps}
      onComplete={onComplete}
      maxLength={INPUT_FIELDS_COUNT}
      pattern={REGEXP_ONLY_DIGITS}
      inputMode="numeric"
      className={containerClassName}
    >
      {pins.map((_, index) => (
        <InputOTPSlot
          // biome-ignore lint/suspicious/noArrayIndexKey: index is unique
          key={index}
          activeClassName={pinActiveClassName}
          index={index}
          caretClassName={caretClassName}
        />
      ))}
    </InputOTP>
  );
};

export default PinInput;
