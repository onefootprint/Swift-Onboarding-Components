import { CleaveOptions } from 'cleave.js/options';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { FontVariant } from 'themes';

import useSx, { SXStyleProps, SXStyles } from '../../../hooks/use-sx';
import Field, { FieldProps } from '../field';
import Hint from '../hint';
import Label from '../label';

export type InternalInputProps = {
  prefixElement?: React.ReactNode;
  suffixElement?: React.ReactNode;
  sx?: SXStyleProps;
  fontVariant?: FontVariant;
};

export type InputProps = FieldProps & {
  mask?: CleaveOptions;
} & InputHTMLAttributes<HTMLInputElement>;

type AllInputProps = InputProps & InternalInputProps;

const BaseInput = forwardRef<HTMLInputElement, AllInputProps>(
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
      sx,
      fontVariant = 'body-3',
      ...remainingProps
    }: AllInputProps,
    ref,
  ) => {
    // TODO: Migrate to useId once we migrate to react 18
    // https://github.com/onefootprint/frontend-monorepo/issues/61
    const id = baseID || `input-${label || placeholder}`;
    const sxStyles = useSx(sx);

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
        {prefixElement}
        <StyledField
          {...remainingProps}
          sx={sxStyles}
          fontVariant={fontVariant}
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

const InputContainer = styled.div`
  position: relative;
`;

const StyledField = styled(Field)<{ sx: SXStyles }>`
  ${({ theme }) => css`
    padding-left: ${theme.spacing[5]}px;
    padding-right: ${theme.spacing[5]}px;
  `}
  ${({ sx }) =>
    css`
      ${sx};
    `}
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
