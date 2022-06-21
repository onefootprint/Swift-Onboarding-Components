import { CleaveOptions } from 'cleave.js/options';
import React, { forwardRef, InputHTMLAttributes, useId } from 'react';
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
      label,
      mask,
      onChange,
      onChangeText,
      prefixElement,
      required,
      suffixElement,
      testID,
      sx,
      id: baseID,
      fontVariant = 'body-3',
      ...remainingProps
    }: AllInputProps,
    ref,
  ) => {
    const fallbackId = useId();
    const id = baseID || fallbackId;
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
      <div>
        {label && <Label htmlFor={id}>{label}</Label>}
        <InputContainer>
          {prefixElement && <PrefixContainer>{prefixElement}</PrefixContainer>}
          <StyledField
            {...remainingProps}
            sx={sxStyles}
            fontVariant={fontVariant}
            $hasError={hasError}
            aria-required={required}
            as={mask ? undefined : 'input'}
            data-testid={testID}
            onChange={handleChange}
            options={mask}
            required={required}
            id={id}
            // We use Cleave.js for mask, and cleave uses htmlRef instead of ref
            // These conditions are important in order to work with react-hook-forms
            ref={mask ? undefined : ref}
            htmlRef={mask ? ref : undefined}
          />
          {suffixElement && <SuffixContainer>{suffixElement}</SuffixContainer>}
        </InputContainer>
        {hintText && (
          <Hint color={hasError ? 'error' : 'tertiary'}>{hintText}</Hint>
        )}
      </div>
    );
  },
);

const InputContainer = styled.div`
  position: relative;
`;

const PrefixContainer = styled.div`
  position: absolute;
  height: 100%;
`;

const SuffixContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
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

export default BaseInput;
