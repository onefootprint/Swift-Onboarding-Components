/* eslint-disable react/jsx-props-no-spreading */
import styled, { css, useTheme } from '@onefootprint/styled';
import React, { forwardRef, useRef, useState } from 'react';
import mergeRefs from 'react-merge-refs';
import {
  NativeSyntheticEvent,
  TextInput as RNTextInput,
  TextInputFocusEventData,
  TextInputProps as RNTextInputProps,
} from 'react-native';

import { Box, BoxProps } from '../box';
import { Hint } from '../hint';
import { Label } from '../label';

export type TextInputProps = {
  prefixComponent?: React.ReactNode;
  disabled?: boolean;
  hasError?: boolean;
  hint?: string;
  label?: string;
} & RNTextInputProps &
  BoxProps;

const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      hasError = false,
      prefixComponent,
      hint,
      label,
      disabled = false,
      onBlur,
      onFocus,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setFocus] = useState(false);
    const localRef = useRef<RNTextInput>(null);
    const {
      components: { input },
    } = useTheme();

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
        {label && (
          <Label onPress={handleLabelPress} marginBottom={3}>
            {label}
          </Label>
        )}
        <Box position="relative">
          {prefixComponent && (
            <PrefixContainer>{prefixComponent}</PrefixContainer>
          )}
          <Input
            {...props}
            disabled={disabled}
            hasError={hasError}
            hasFocus={isFocused}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholderTextColor={input.global.placeholderColor}
            ref={mergeRefs([ref, localRef])}
            underlineColorAndroid="transparent"
          />
        </Box>
        {!!hint && (
          <Hint marginTop={3} hasError={hasError}>
            {hint}
          </Hint>
        )}
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
      `}

      ${hasError &&
      css`
        background: ${input.state.error.focus.bg};
        border: ${input.state.error.focus.border};
      `}

      ${disabled &&
      css`
        background: ${input.state.disabled.bg};
        border: ${input.state.disabled.border};
      `}
    `;
  }}
`;

const PrefixContainer = styled.View`
  position: absolute;
  height: 100%;
  z-index: 1;
  justify-content: center;
`;

export default TextInput;
