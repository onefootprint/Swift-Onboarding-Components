import styled from '@onefootprint/styled';
import identity from 'lodash/identity';
import React, { useState } from 'react';

import Hint from '../internal/hint';
import Input from '../internal/input';
import usePinInputRefs from './hooks/use-pin-input-refs';
import { INPUT_FIELDS_COUNT, pins } from './pin-input.constants';
import { getNextValue, isNumber } from './pin-input.utils';

export type PinInputProps = {
  hasError?: boolean;
  hint?: string;
  onComplete: (value: string) => void;
  testID?: string;
};

const PinInput = ({
  hasError = false,
  hint,
  onComplete,
  testID,
}: PinInputProps) => {
  const [enteredPin, setEnteredPin] = useState<string[]>([]);
  const pinInputs = usePinInputRefs(INPUT_FIELDS_COUNT);

  const updatePin = (nextValue: string, pinIndex: number) => {
    const nextValues = [...enteredPin];
    nextValues[pinIndex] = nextValue;
    setEnteredPin(nextValues);
    return nextValues;
  };

  const moveToNextOrComplete = (pin: string, index: number) => {
    const isLastIndex = index === INPUT_FIELDS_COUNT - 1;
    const areAllTheFieldsFilled =
      pin.length === INPUT_FIELDS_COUNT && Array.from(pin).every(identity);
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
    <Container data-testid={testID}>
      <PinContainer>
        {pins.map((pinPosition, pinIndex) => {
          const key = pinIndex;
          const isDisabled = pinIndex > enteredPin.length;
          return (
            <Input
              hasError={hasError}
              inputMode="numeric"
              key={key}
              onChange={handleChange(pinIndex)}
              onKeyDown={handleKeyDown(pinIndex)}
              placeholder=""
              sx={{
                height: '44px',
                padding: 0,
                pointerEvents: isDisabled ? 'none' : undefined,
                textAlign: 'center',
                width: '40px',
              }}
              ref={pinInputs.refs[pinIndex]}
              required
              type="tel"
              className="fp-pin-input"
              value={enteredPin[pinIndex] || ''}
            />
          );
        })}
      </PinContainer>
      {!!hint && <Hint hasError={hasError}>{hint}</Hint>}
    </Container>
  );
};

const Container = styled.div``;

export const PinContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing[3]};
`;

export default PinInput;
