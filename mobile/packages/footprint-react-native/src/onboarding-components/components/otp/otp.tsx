import identity from 'lodash/identity';
import React, { useState } from 'react';
import type {
  NativeSyntheticEvent,
  TextInputChangeEventData,
  TextInputKeyPressEventData,
  TextInputProps,
} from 'react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import type { InputProps } from '../input';
import usePinInputRefs from './hooks/use-otp-input-refs';
import { INPUT_FIELDS_COUNT, pins } from './otp.constants';
import { getNextValue, isNumber } from './otp.utils';

export type PinInputProps = InputProps & {
  as?: React.ComponentType<TextInputProps>;
  containerStyle?: View['props']['style'];
  onComplete?: (value: string) => void;
};

const PinInput: React.FC<PinInputProps> = ({ as: Component = TextInput, containerStyle, hasError = false, onComplete, ...props }) => {
  const { autoFocus, ...inputProps } = props;
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
        setTimeout(() => nextInput.focus(), 50); // For some reason, you cannot focus on non-editable text input. You first have to wait for it to be editable, and then focus. A little hacky approach
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
    <View style={[styles.container, containerStyle]}>
      {pins.map((_, pinIndex) => {
        const key = pinIndex;
        return (
          <Component
            {...inputProps}
            autoComplete="sms-otp"
            autoFocus={autoFocus && pinIndex === 0}
            blurOnSubmit
            inputMode="numeric"
            key={key}
            onChange={handleChange(pinIndex)}
            onKeyPress={handleKeyPress(pinIndex)}
            placeholder=""
            /** @ts-ignore */
            ref={pinInputs.refs[pinIndex]}
            textAlign="center"
            value={enteredPin[pinIndex] || ''}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default PinInput;