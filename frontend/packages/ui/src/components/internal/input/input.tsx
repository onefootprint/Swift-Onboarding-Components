import { CleaveOptions } from 'cleave.js/options';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { css } from 'styled';

import Field, { FieldProps } from '../field';
import Hint from '../hint';
import Label from '../label';

export type InputProps = FieldProps & {
  prefixElement?: JSX.Element;
  suffixElement?: JSX.Element;
  mask?: CleaveOptions;
} & InputHTMLAttributes<HTMLInputElement>;

const BaseInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      hasError = false,
      hintText,
      id: baseID,
      label,
      mask,
      onChange,
      onChangeText,
      placeholder,
      prefixElement,
      required,
      suffixElement,
      testID,
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
          {...remainingProps}
          $hasError={hasError}
          aria-required={required}
          as={mask ? undefined : 'input'}
          data-testid={testID}
          id={id}
          onChange={handleChange}
          options={mask}
          placeholder={placeholder}
          required={required}
          // We use Cleave.js for mask, and cleave uses htmlRef instead of ref
          // These conditions are important in order to work with react-hook-forms
          ref={mask ? undefined : ref}
          htmlRef={mask ? ref : undefined}
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
