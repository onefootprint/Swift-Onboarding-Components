/* eslint-disable react/jsx-props-no-spreading */
import cx from 'classnames';
import type { InputHTMLAttributes } from 'react';
import React, { useEffect, useState } from 'react';

import Hint from '../../../hint';
import Input from '../../../internal/input';
import usePinInputRefs from './hooks/use-pin-input-refs';
import { INPUT_FIELDS_COUNT, pins } from './pin-input.constants';
import { getNextValue, isNumber } from './pin-input.utils';

export type OtpPinInputProps = {
  autoFocus?: boolean;
  containerClassName?: string;
  disabled?: boolean;
  hasError?: boolean;
  message?: string;
  messageClassName?: string;
  onComplete?: (value: string) => void;
} & InputHTMLAttributes<HTMLInputElement>;

const PinInput = ({
  autoFocus,
  className,
  containerClassName,
  disabled,
  hasError = false,
  message,
  messageClassName,
  onComplete,
  ...props
}: OtpPinInputProps) => {
  const [enteredPin, setEnteredPin] = useState<string[]>([]);
  const pinInputs = usePinInputRefs(INPUT_FIELDS_COUNT);

  useEffect(() => {
    const firstPinInput = pinInputs.get(0);
    if (firstPinInput && !disabled && autoFocus) {
      firstPinInput.focus();
    }
  }, [autoFocus, disabled, pinInputs]);

  const updatePin = (nextValue: string, pinIndex: number) => {
    const nextValues = [...enteredPin];
    nextValues[pinIndex] = nextValue;
    setEnteredPin(nextValues);
    return nextValues;
  };

  const moveToNextOrComplete = (pin: string, index: number) => {
    const isLastIndex = index === INPUT_FIELDS_COUNT - 1;
    const areAllTheFieldsFilled =
      pin.length === INPUT_FIELDS_COUNT && Array.from(pin).every(v => v);
    if (isLastIndex && areAllTheFieldsFilled) {
      const currentInput = pinInputs.get(index);
      if (currentInput) currentInput.blur();
      onComplete?.(pin);
    } else {
      const nextInput = pinInputs.next(index);
      if (nextInput) {
        setTimeout(() => {
          nextInput.focus();
          nextInput.select();
        }, 0);
      }
    }
  };

  const handleChange =
    (pinIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const eventValue = event.target.value;
      const currentValue = enteredPin[pinIndex];
      const nextValue = getNextValue(currentValue, eventValue);
      if (nextValue === '') {
        updatePin('', pinIndex);
      }
      const wasPinPastedOrAutoCompleted = eventValue.length > 2;
      if (wasPinPastedOrAutoCompleted) {
        if (isNumber(eventValue)) {
          const nextPin = Array.from(eventValue).filter(
            (_, index) => index < INPUT_FIELDS_COUNT,
          );
          setEnteredPin(nextPin);
          moveToNextOrComplete(nextPin.join(''), nextPin.length - 1);
        }
      } else if (isNumber(nextValue)) {
        const nextPin = updatePin(nextValue, pinIndex);
        moveToNextOrComplete(nextPin.join(''), pinIndex);
      }
    };

  const handleKeyDown = (pinIndex: number) => (event: React.KeyboardEvent) => {
    const element = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && element.value === '') {
      const previousInput = pinInputs.previous(pinIndex);
      if (previousInput) {
        updatePin('', pinIndex - 1);
        previousInput.focus();
      }
    }
  };

  return (
    <>
      <div className={cx('fp-otp-pin-input-container', containerClassName)}>
        {pins.map((pinPosition, pinIndex) => {
          const key = pinIndex;
          const isIndexDisabled = pinIndex > enteredPin.length;
          return (
            <Input
              {...props}
              autoComplete="one-time-code"
              className={cx('fp-otp-pin-input', className)}
              disabled={disabled || isIndexDisabled}
              hasError={hasError}
              inputMode="numeric"
              key={key}
              maxLength={1}
              onChange={handleChange(pinIndex)}
              onKeyDown={handleKeyDown(pinIndex)}
              placeholder=""
              ref={pinInputs.refs[pinIndex]}
              required
              type="tel"
              value={enteredPin[pinIndex] || ''}
              width="40px"
            />
          );
        })}
      </div>
      {!!message && (
        <Hint
          className={cx('fp-otp-pin-input-message', messageClassName)}
          hasError={hasError}
        >
          {message}
        </Hint>
      )}
    </>
  );
};

export default PinInput;
