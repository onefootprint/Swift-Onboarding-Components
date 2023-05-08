/* eslint-disable react/jsx-props-no-spreading */
import styled, { css, useTheme } from '@onefootprint/styled';
import React, { forwardRef, useRef, useState } from 'react';
import { mergeRefs } from 'react-merge-refs';
import {
  NativeSyntheticEvent,
  TextInput as RNTextInput,
  TextInputFocusEventData,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { useTimeout } from 'usehooks-ts';

import { Box, BoxProps } from '../box';
import { Label } from '../label';

export type TextInputProps = {
  hasError?: boolean;
  label?: string;
  disabled?: boolean;
} & RNTextInputProps &
  BoxProps;

const TextInput = forwardRef<RNTextInput, TextInputProps>(
  ({ hasError = false, label, disabled = false, ...props }, ref) => {
    const { autoFocus, onBlur, onFocus } = props;
    const [isFocused, setFocus] = useState(false);
    const localRef = useRef<RNTextInput>(null);
    const {
      components: { input },
    } = useTheme();

    useTimeout(() => {
      if (autoFocus) {
        localRef.current?.focus();
      }
    }, 700);

    const handleLabelPress = () => {
      localRef.current?.focus();
    };

    const handleFocus = (
      event: NativeSyntheticEvent<TextInputFocusEventData>,
    ) => {
      setFocus(true);
      onFocus?.(event);
    };

    const handleBlur = (
      event: NativeSyntheticEvent<TextInputFocusEventData>,
    ) => {
      setFocus(false);
      onBlur?.(event);
    };

    return (
      <Box>
        {label && <Label onPress={handleLabelPress}>{label}</Label>}
        <Input
          {...props}
          underlineColorAndroid="transparent"
          disabled={disabled}
          hasError={hasError}
          onBlur={handleBlur}
          onFocus={handleFocus}
          hasFocus={isFocused}
          placeholderTextColor={input.global.placeholderColor}
          ref={mergeRefs([ref, localRef])}
        />
      </Box>
    );
  },
);

const Input = styled.TextInput<{
  hasFocus: boolean;
  hasError: boolean;
  disabled: boolean;
}>`
  ${({ theme, hasFocus, hasError, disabled }) => {
    const {
      components: { input },
    } = theme;

    return css`
      background: ${input.state.default.initial.bg};
      border-color: ${input.state.default.initial.border};
      border-radius: ${input.global.borderRadius};
      border-style: solid;
      border-width: ${input.global.borderWidth};
      color: ${input.global.color};
      font: ${input.size.default.typography};
      height: ${input.size.default.height};
      padding-horizontal: ${theme.spacing[5]};

      ${hasFocus &&
      css`
        background: ${input.state.default.focus.bg};
        border: ${input.state.default.focus.border};
        box-shadow: ${input.state.default.focus.elevation};
      `}

      ${hasError &&
      css`
        background: ${input.state.error.focus.bg};
        border: ${input.state.error.focus.border};
        box-shadow: ${input.state.error.focus.elevation};
      `}

      ${disabled &&
      css`
        background: ${input.state.disabled.bg};
        border: ${input.state.disabled.border};
      `}
    `;
  }}
`;

export default TextInput;
