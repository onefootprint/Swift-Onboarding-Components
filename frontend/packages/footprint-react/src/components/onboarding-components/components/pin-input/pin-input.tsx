import cx from 'classnames';
import type React from 'react';
import { type InputHTMLAttributes, useEffect, useReducer, useRef } from 'react';

import { INPUT_FIELDS_COUNT, pins } from './pin-input.constants';
import { getNextValue, isNumber } from './pin-input.utils';

export type PinInputProps = {
  containerClassName?: string;
  onComplete: (value: string) => void;
} & InputHTMLAttributes<HTMLInputElement>;

const PinInput = ({ containerClassName, onComplete, disabled, className, autoFocus, ...props }: PinInputProps) => {
  const [_, forceUpdate] = useReducer(x => x + 1, 0);
  const input0 = useRef<HTMLInputElement>(null);
  const input1 = useRef<HTMLInputElement>(null);
  const input2 = useRef<HTMLInputElement>(null);
  const input3 = useRef<HTMLInputElement>(null);
  const input4 = useRef<HTMLInputElement>(null);
  const input5 = useRef<HTMLInputElement>(null);
  const refs = [input0, input1, input2, input3, input4, input5];

  const handleCompletePinPaste = (values: string) => {
    const lastInput = refs[INPUT_FIELDS_COUNT - 1];
    const arrayOfValues = Array.from(values);

    /** Update the inputs with the copied values */
    arrayOfValues.forEach((value, idx) => {
      if (refs[idx].current) {
        refs[idx].current.value = value;
      }
    });
    forceUpdate();

    setTimeout(() => {
      lastInput.current?.focus();
      lastInput.current?.select();
    }, 0);

    return onComplete(values);
  };

  const focusAdjacentInput = (pinIndex: number, shouldFocusNext: boolean) => {
    const otherInput = shouldFocusNext ? refs[pinIndex + 1] : refs[pinIndex - 1];
    if (otherInput?.current) {
      setTimeout(() => {
        otherInput.current?.focus();
        otherInput.current?.select();
      }, 0);
    }
  };

  const handleChange = (pinIndex: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const values = event.target.value;
    const input = refs[pinIndex];
    if (!input.current) return;
    if (!isNumber(values) && values !== '') return;

    const isCompletePinPaste = values.length === INPUT_FIELDS_COUNT;
    if (isCompletePinPaste) {
      return handleCompletePinPaste(values);
    }

    input.current.value = getNextValue(input.current.value, values);
    forceUpdate();

    const combinedPinValues = refs.map(ref => ref.current?.value || '').join('');
    if (combinedPinValues.length === INPUT_FIELDS_COUNT) {
      return onComplete(combinedPinValues);
    }

    focusAdjacentInput(pinIndex, isNumber(values));
  };

  useEffect(() => {
    const firstPinInput = input0.current;
    if (firstPinInput && !disabled && autoFocus) {
      firstPinInput.focus();
      firstPinInput.select();
    }
  }, [autoFocus, disabled, input0]);

  return (
    <div className={cx('fp-pin-input-container', containerClassName)}>
      {pins.map((_pinPosition, pinIndex) => {
        const key = `${_pinPosition}-${pinIndex}`;
        const isIndexDisabled = pinIndex > 0 && !refs[pinIndex - 1]?.current?.value;

        return (
          <input
            {...(pinIndex === 0 && { autoComplete: 'one-time-code' })}
            inputMode="numeric"
            disabled={disabled || isIndexDisabled}
            key={key}
            onChange={event => handleChange(pinIndex, event)}
            placeholder=""
            ref={refs[pinIndex]}
            required
            type="tel"
            value={refs[pinIndex]?.current?.value || ''}
            className={cx('fp-input fp-pin-input', className)}
            {...props}
          />
        );
      })}
    </div>
  );
};

export default PinInput;
