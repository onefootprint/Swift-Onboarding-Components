'use client';

import identity from 'lodash/identity';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import Hint from '../hint';
import Input from '../internal/input';
import usePinInputRefs from './hooks/use-pin-input-refs';
import { INPUT_FIELDS_COUNT, pins } from './pin-input.constants';
import { getNextValue, isNumber } from './pin-input.utils';

export type PinInputProps = {
  hasError?: boolean;
  hint?: string;
  onComplete: (value: string) => void;
  testID?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

const PinInput = ({ hasError = false, hint, onComplete, testID, disabled, autoFocus }: PinInputProps) => {
  const [enteredPin, setEnteredPin] = useState<string[]>([]);
  const pinInputs = usePinInputRefs(INPUT_FIELDS_COUNT);

  useEffect(() => {
    const firstPinInput = pinInputs.get(0);
    if (firstPinInput && !disabled && autoFocus) firstPinInput.focus();
  }, [autoFocus, disabled, pinInputs]);

  const updatePin = (nextValue: string, pinIndex: number) => {
    const nextValues = [...enteredPin];
    nextValues[pinIndex] = nextValue;
    setEnteredPin(nextValues);
    return nextValues;
  };

  const moveToNextOrComplete = (pin: string, index: number) => {
    const isLastIndex = index === INPUT_FIELDS_COUNT - 1;
    const areAllTheFieldsFilled = pin.length === INPUT_FIELDS_COUNT && Array.from(pin).every(identity);
    if (isLastIndex && areAllTheFieldsFilled) {
      onComplete(pin);
    } else {
      const nextInput = pinInputs.next(index);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  const handleChange = (pinIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
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
    <Container data-testid={testID}>
      <PinContainer>
        {pins.map((_pinPosition, pinIndex) => {
          const key = pinIndex;
          const isIndexDisabled = pinIndex > enteredPin.length;
          return (
            <Pin
              autoComplete="one-time-code"
              /** Do not change/remove these classes */
              className="fp-pin-input fp-custom-appearance"
              data-nid-target={`otp${pinIndex + 1}`}
              data-dd-action-name={`otp:click-${pinIndex + 1}`}
              hasError={hasError}
              inputMode="numeric"
              $isDisabled={disabled || isIndexDisabled}
              key={key}
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
      </PinContainer>
      {!!hint && <Hint hasError={hasError}>{hint}</Hint>}
    </Container>
  );
};

const Container = styled.div``;

const PinContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const Pin = styled(Input)<{ $isDisabled: boolean }>`
  ${({ $isDisabled }) => css`
    height: 44px;
    padding: 0;
    pointer-events: ${$isDisabled ? 'none' : undefined};
    text-align: center;
  `}
`;

export default PinInput;
