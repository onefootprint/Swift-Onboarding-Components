import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { css } from 'styled';

import Field, { FieldProps } from '../field';
import Hint from '../hint';
import Label from '../label';

export type InputProps = FieldProps & {
  prefixElement?: JSX.Element;
  suffixElement?: JSX.Element;
} & InputHTMLAttributes<HTMLInputElement>;

const BaseInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      autoComplete,
      disabled = false,
      hasError = false,
      hintText,
      label,
      name,
      onChange,
      onChangeText,
      placeholder,
      required,
      tabIndex,
      testID,
      id: baseID,
      prefixElement,
      suffixElement,
      ...remainingProps
    }: InputProps,
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
      <InputContainer hasPrefix={!!prefixElement}>
        {label && <Label htmlFor={id}>{label}</Label>}
        {prefixElement && <PrefixContainer>{prefixElement}</PrefixContainer>}
        <StyledField
          aria-required={required}
          as="input"
          autoComplete={autoComplete}
          data-testid={testID}
          hasError={hasError}
          id={id}
          name={name}
          onChange={handleChange}
          placeholder={placeholder}
          ref={ref}
          required={required}
          tabIndex={disabled ? -1 : tabIndex}
          {...remainingProps}
        />
        {hintText && (
          <Hint color={hasError ? 'error' : 'tertiary'}>{hintText}</Hint>
        )}
        {suffixElement && <SuffixContainer>{suffixElement}</SuffixContainer>}
      </InputContainer>
    );
  },
);

const InputContainer = styled.div<{
  hasPrefix: boolean;
}>`
  position: relative;
  input {
    ${({ theme, hasPrefix }) =>
      hasPrefix &&
      css`
        padding-left: ${theme.spacing[9] + theme.spacing[2]}px;
      `}
  }
`;

const StyledField = styled(Field)<InputProps>`
  ${({ theme }) => css`
    padding: 0 ${theme.spacing[5]}px;
  `}
`;

const PrefixContainer = styled.div`
  position: absolute;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SuffixContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default BaseInput;
