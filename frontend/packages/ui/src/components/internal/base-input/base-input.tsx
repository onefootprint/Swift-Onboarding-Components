/* eslint-disable react/jsx-props-no-spreading */
import { darken, rgba } from 'polished';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { css } from 'styled';

import Hint from '../hint';
import Label from '../label';

export type BaseInputProps = {
  hasError?: boolean;
  hintText?: string;
  label?: string;
  onChangeText?: (nextValue: string) => void;
  placeholder: string;
  testID?: string;
  value?: string;
} & InputHTMLAttributes<HTMLInputElement>;

const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(
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
      maxLength,
      minLength,
      name,
      onClick,
      onChange,
      onChangeText,
      placeholder,
      readOnly,
      required,
      tabIndex,
      testID,
      type,
      id: baseID,
      value,
      ...rest
    }: BaseInputProps,
    ref,
  ) => {
    // TODO: Migrate to useId once we migrate to react 18
    // https://github.com/onefootprint/frontend-monorepo/issues/61
    const id = baseID || `input-${label || placeholder}`;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(event);
      }
      if (onChangeText) {
        onChangeText(event.currentTarget.value);
      }
    };

    return (
      <InputContainer>
        {label && <Label htmlFor={id}>{label}</Label>}
        <Input
          $hasError={hasError}
          alt={alt}
          aria-required={required}
          autoComplete={autoComplete}
          data-testid={testID}
          defaultValue={defaultValue}
          id={id}
          inputMode={inputMode}
          maxLength={maxLength}
          minLength={minLength}
          name={name}
          placeholder={placeholder}
          ref={ref}
          required={required}
          tabIndex={disabled ? -1 : tabIndex}
          type={type}
          value={value}
          {...rest}
          onChange={handleChange}
        />
        {hintText && (
          <Hint color={hasError ? 'error' : 'tertiary'}>{hintText}</Hint>
        )}
      </InputContainer>
    );
  },
);

const InputContainer = styled.div``;

const Input = styled.input<{
  $hasError: boolean;
}>`
  ${({ $hasError, theme }) => {
    const defaultBorderColor = $hasError ? 'error' : 'primary';
    const hoverBorderColor = $hasError ? 'error' : 'primary';
    const focusBorderColor = $hasError ? 'error' : 'secondary';
    return css`
      background-color: ${theme.backgroundColor.primary};
      border-radius: ${theme.borderRadius[1]}px;
      border: ${theme.borderWidth[1]}px solid
        ${theme.borderColor[defaultBorderColor]};
      color: ${theme.color.primary};
      font-family: ${theme.typography['body-3'].fontFamily};
      font-size: ${theme.typography['body-3'].fontSize};
      font-weight: ${theme.typography['body-3'].fontWeight};
      height: 40px;
      line-height: ${theme.typography['body-3'].lineHeight};
      outline: none;
      padding: 0 ${theme.spacing[5]}px;
      width: 100%;

      &:hover:enabled {
        border: ${theme.borderWidth[1]}px solid
          ${hoverBorderColor === 'error'
            ? darken(0.1, theme.borderColor[hoverBorderColor])
            : darken(0.32, theme.borderColor[hoverBorderColor])};
      }

      &:focus:enabled {
        -webkit-appearance: none;
        border-color: ${theme.borderColor[focusBorderColor]};
        box-shadow: 0 0 0 4px ${rgba(theme.borderColor[focusBorderColor], 0.1)};
      }

      &:disabled {
        background: ${theme.backgroundColor.secondary};
        color: ${theme.color.tertiary};
        cursor: not-allowed;
      }

      ::placeholder {
        color: ${theme.color.tertiary};
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

export default BaseInput;
