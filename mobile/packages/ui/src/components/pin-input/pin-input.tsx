import identity from 'lodash/identity';
import React, { useState } from 'react';
import type { NativeSyntheticEvent, TextInputChangeEventData, TextInputKeyPressEventData } from 'react-native';

import Box from '../box';
import Hint from '../hint';
import type { TextInputProps } from '../text-input';
import TextInput from '../text-input';
import usePinInputRefs from './hooks/use-pin-input-refs';
import { INPUT_FIELDS_COUNT, pins } from './pin-input.constants';
import { getNextValue, isNumber } from './pin-input.utils';

export type PinInputProps = TextInputProps & {
  hasError?: boolean;
  hint?: string;
  onComplete?: (value: string) => void;
};

const PinInput = ({ hasError = false, hint, onComplete, ...props }: PinInputProps) => {
  const { autoFocus, disabled, ...inputProps } = props;
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
    const areAllTheFieldsFilled = pin.length === INPUT_FIELDS_COUNT && Array.from(pin).every(identity);

    if (isLastIndex && areAllTheFieldsFilled) {
      onComplete?.(pin);
    } else {
      const nextInput = pinInputs.next(index);
      if (nextInput) {
        setTimeout(() => nextInput.focus(), 50); // For some reason, you cannot focus on non-editable text input. You fist have to wait for it to be editable, and then focus. A little hacky approach
      }
    }
  };

  const handleChange = (pinIndex: number) => (event: NativeSyntheticEvent<TextInputChangeEventData>) => {
    const eventValue = event.nativeEvent.text;
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

  const handleKeyPress = (pinIndex: number) => (event: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (event.nativeEvent.key === 'Backspace') {
      const previousInput = pinInputs.previous(pinIndex);
      if (previousInput) {
        updatePin('', pinIndex - 1);
        previousInput.focus();
      }
    }
  };

  return (
    <Box>
      <Box gap={3} flexDirection="row" center>
        {pins.map((_, pinIndex) => {
          const key = pinIndex;
          const isDisabled = disabled || pinIndex > enteredPin.length;
          return (
            <TextInput
              {...inputProps}
              autoComplete="sms-otp"
              autoFocus={autoFocus && pinIndex === 0}
              blurOnSubmit
              disabled={isDisabled}
              hasError={hasError}
              height={44}
              inputMode="numeric"
              key={key}
              onChange={handleChange(pinIndex)}
              onKeyPress={handleKeyPress(pinIndex)}
              padding={0}
              paddingHorizontal={undefined}
              placeholder=""
              ref={pinInputs.refs[pinIndex]}
              textAlign="center"
              value={enteredPin[pinIndex] || ''}
              width={40}
            />
          );
        })}
      </Box>
      {!!hint && (
        <Hint marginTop={3} hasError={hasError}>
          {hint}
        </Hint>
      )}
    </Box>
  );
};

export default PinInput;
