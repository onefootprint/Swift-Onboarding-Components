import { darken, rgba } from 'polished';
import React, { forwardRef, useRef } from 'react';
import InputMask from 'react-input-mask';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled';

import Hint from '../hint';
import Label from '../label';
import { InputFieldProps } from './input-field.types';

const InputField = forwardRef(
  (
    {
      alt,
      autoComplete,
      defaultValue,
      disabled = false,
      hasError = false,
      hintText,
      inputMode,
      label,
      mask = '',
      maskPlaceholder = null,
      maxLength,
      minLength,
      name,
      onBlur,
      onChange,
      onChangeText,
      onKeyDown,
      onKeyUp,
      onFocus,
      placeholder,
      readOnly,
      required,
      tabIndex,
      testID,
      type,
      value = '',
    }: InputFieldProps,
    ref,
  ) => {
    // TODO: Migrate to useId once we migrate to react 18
    // https://github.com/onefootprint/frontend-monorepo/issues/61
    const id = `input-${label || placeholder}`;
    const localRef = useRef<HTMLInputElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event);
      }
      if (onChangeText) {
        onChangeText(event.currentTarget.value);
      }
    };

    return (
      <>
        {label && <Label htmlFor={id}>{label}</Label>}
        <InputContainer>
          <InputMask
            alwaysShowMask={false}
            disabled={disabled}
            mask={mask}
            maskPlaceholder={maskPlaceholder}
            onBlur={onBlur}
            onChange={disabled ? undefined : handleChange}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            readOnly={readOnly}
            value={value}
          >
            <Input
              $hasError={hasError}
              alt={alt}
              autoComplete={autoComplete}
              data-testid={testID}
              defaultValue={defaultValue}
              id={id}
              inputMode={inputMode}
              maxLength={maxLength}
              minLength={minLength}
              name={name}
              placeholder={placeholder}
              ref={mergeRefs([localRef, ref])}
              required={required}
              tabIndex={tabIndex}
              type={type}
            />
          </InputMask>
        </InputContainer>
        {hintText && (
          <Hint color={hasError ? 'error' : 'tertiary'}>{hintText}</Hint>
        )}
      </>
    );
  },
);

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input<{
  $hasError: boolean;
}>`
  ${({ $hasError, theme }) => {
    const defaultBorderColor = $hasError ? 'error' : 'primary';
    const hoverBorderColor = $hasError ? 'error' : 'primary';
    const focusBorderColor = $hasError ? 'error' : 'secondary';
    return css`
      background-color: ${theme.backgroundColors.primary};
      border-radius: ${theme.borderRadius[1]}px;
      border: ${theme.borderWidths[1]}px solid
        ${theme.borderColors[defaultBorderColor]};
      color: ${theme.colors.primary};
      font-family: ${theme.typographies['body-3'].fontFamily};
      font-size: ${theme.typographies['body-3'].fontSize}px;
      font-weight: ${theme.typographies['body-3'].fontWeight};
      height: 40px;
      line-height: ${theme.typographies['body-3'].lineHeight}px;
      outline: none;
      padding: 0 ${theme.spacings[5]}px;
      width: 100%;

      &:hover:enabled {
        border: ${theme.borderWidths[1]}px solid
          ${hoverBorderColor === 'error'
            ? darken(0.1, theme.borderColors[hoverBorderColor])
            : darken(0.32, theme.borderColors[hoverBorderColor])};
      }

      &:focus:enabled {
        -webkit-appearance: none;
        border-color: ${theme.borderColors[focusBorderColor]};
        box-shadow: 0 0 0 4px ${rgba(theme.borderColors[focusBorderColor], 0.1)};
      }

      &:disabled {
        background: ${theme.backgroundColors.secondary};
        color: ${theme.colors.tertiary};
        cursor: not-allowed;
      }

      ::placeholder {
        color: ${theme.colors.tertiary};
      }

      ::-webkit-credentials-auto-fill-button {
        visibility: hidden;
        pointer-events: none;
        position: absolute;
        right: 0;
      }
    `;
  }}
`;

export default InputField;
