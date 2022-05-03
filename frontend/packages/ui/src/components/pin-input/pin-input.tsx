import defer from 'lodash/defer';
import identity from 'lodash/identity';
import React, { useState } from 'react';

import Hint from '../internal/hint';
import InputField from '../internal/input-field';
import usePinInputRefs from './hooks/use-pin-input-refs';
import { INPUT_FIELDS_COUNT, pins } from './pin-input.constants';
import * as S from './pin-input.styles';
import { getNextValue, isNumber } from './pin-input.utils';

const waitNextInputFieldGetDisabled = defer;

export type PinInputProps = {
  hasError?: boolean;
  hintText?: string;
  onComplete: (value: string) => void;
  testID?: string;
};

const PinInput = ({
  hasError = false,
  hintText,
  onComplete,
  testID,
}: PinInputProps) => {
  const [enteredPin, setEnteredPin] = useState<string[]>([]);
  const inputRefs = usePinInputRefs();

  const updatePin = (nextValue: string, pinIndex: number) => {
    const nextValues = [...enteredPin];
    nextValues[pinIndex] = nextValue;
    setEnteredPin(nextValues);
    return nextValues;
  };

  const moveToNextOrComplete = (pin: string, index: number) => {
    const isCompleted =
      pin.length === INPUT_FIELDS_COUNT && Array.from(pin).every(identity);
    if (isCompleted) {
      onComplete(pin);
    } else {
      const nextInput = inputRefs.next(index);
      if (nextInput) {
        waitNextInputFieldGetDisabled(() => {
          nextInput.focus();
          nextInput.select();
        });
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
      const previousInput = inputRefs.previous(pinIndex);
      if (previousInput) {
        updatePin('', pinIndex - 1);
        previousInput.focus();
      }
    }
  };

  return (
    <S.Container data-testid={testID}>
      <S.PinContainer>
        {pins.map((pinPosition, pinIndex) => {
          const key = pinIndex;
          return (
            <InputField
              autoComplete="one-time-code"
              disabled={pinIndex > enteredPin.length}
              hasError={hasError}
              inputMode="numeric"
              key={key}
              onChange={handleChange(pinIndex)}
              onKeyDown={handleKeyDown(pinIndex)}
              placeholder=""
              ref={inputRefs.add}
              required
              type="tel"
              value={enteredPin[pinIndex]}
            />
          );
        })}
      </S.PinContainer>
      {!!hintText && (
        <Hint color={hasError ? 'error' : 'primary'}>{hintText}</Hint>
      )}
    </S.Container>
  );
};

export default PinInput;
