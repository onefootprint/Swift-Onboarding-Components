import identity from 'lodash/identity';
/* eslint-disable react/jsx-props-no-spreading */
import { type InputHTMLAttributes, useEffect, useState } from 'react';

import usePinInputRefs from './hooks/use-pin-input-refs';
import { INPUT_FIELDS_COUNT, pins } from './pin-input.constants';
import { getNextValue, isNumber } from './pin-input.utils';

export type PinInputProps = {
  containerClassName?: string;
  onComplete: (value: string) => void;
} & InputHTMLAttributes<HTMLInputElement>;

const PinInput = ({ containerClassName, onComplete, disabled, className, autoFocus, ...props }: PinInputProps) => {
  const [enteredPin, setEnteredPin] = useState([]);
  const pinInputs = usePinInputRefs(INPUT_FIELDS_COUNT);

  useEffect(() => {
    const firstPinInput = pinInputs.get(0);
    if (firstPinInput && !disabled && autoFocus) firstPinInput.focus();
  }, [autoFocus, disabled, pinInputs]);

  const updatePin = (nextValue, pinIndex) => {
    const nextValues = [...enteredPin];
    nextValues[pinIndex] = nextValue;
    setEnteredPin(nextValues);
    return nextValues;
  };

  const moveToNextOrComplete = (pin, index) => {
    const isLastIndex = index === INPUT_FIELDS_COUNT - 1;
    const areAllTheFieldsFilled = pin.length === INPUT_FIELDS_COUNT && Array.from(pin).every(identity);

    if (isLastIndex && areAllTheFieldsFilled) {
      onComplete(pin);
    } else {
      const nextInput = pinInputs.next(index);
      if (nextInput) {
        requestAnimationFrame(() => {
          nextInput.focus();
          nextInput.select();
        });
      }
    }
  };

  const handleChange = pinIndex => event => {
    const eventValue = event.target.value;
    const currentValue = enteredPin[pinIndex];
    const nextValue = getNextValue(currentValue, eventValue);
    if (nextValue === '') {
      updatePin('', pinIndex);
    }
    const wasPinPastedOrAutoCompleted = eventValue.length > 2;
    if (wasPinPastedOrAutoCompleted) {
      if (isNumber(eventValue)) {
        const nextPin = Array.from(eventValue).filter((_, index) => index < INPUT_FIELDS_COUNT);
        setEnteredPin(nextPin);
        moveToNextOrComplete(nextPin.join(''), nextPin.length - 1);
      }
    } else if (isNumber(nextValue)) {
      const nextPin = updatePin(nextValue, pinIndex);
      moveToNextOrComplete(nextPin.join(''), pinIndex);
    }
  };

  const handleKeyDown = pinIndex => event => {
    const element = event.target;
    if (event.key === 'Backspace' && element.value === '') {
      const previousInput = pinInputs.previous(pinIndex);
      if (previousInput) {
        updatePin('', pinIndex - 1);
        previousInput.focus();
      }
    }
  };

  return (
    <div className="fp-pin-input-container">
      {pins.map((_pinPosition, pinIndex) => {
        const key = pinIndex;
        const isIndexDisabled = pinIndex > enteredPin.length;

        return (
          <input
            autoComplete="one-time-code"
            inputMode="numeric"
            disabled={disabled || isIndexDisabled}
            key={key}
            onChange={handleChange(pinIndex)}
            onKeyDown={handleKeyDown(pinIndex)}
            placeholder=""
            ref={pinInputs.refs[pinIndex]}
            required
            type="tel"
            value={enteredPin[pinIndex] || ''}
            className="fp-input fp-pin-input"
            {...props}
          />
        );
      })}
    </div>
  );
};

export default PinInput;
