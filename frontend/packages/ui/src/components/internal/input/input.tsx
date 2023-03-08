import { FontVariant } from '@onefootprint/design-tokens';
import { CleaveOptions } from 'cleave.js/options';
import React, { forwardRef, InputHTMLAttributes, useId } from 'react';
import styled, { css } from 'styled-components';

import useSx, { SXStyleProps, SXStyles } from '../../../hooks/use-sx';
import Label from '../../form-label';
import Field, { FieldProps } from '../field';
import Hint from '../hint';

export type InternalInputProps = {
  prefixComponent?: React.ReactNode;
  suffixComponent?: React.ReactNode;
  fontVariant?: FontVariant;
};

type NativeInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>;

export type InputProps = {
  value?: string;
  mask?: CleaveOptions;
  sx?: SXStyleProps;
} & NativeInputProps &
  FieldProps;

type AllInputProps = InputProps & InternalInputProps;

const BaseInput = forwardRef<HTMLInputElement, AllInputProps>(
  (
    {
      className,
      disabled = false,
      hasError = false,
      hasFocus = false,
      hint,
      id: baseID,
      label,
      mask,
      onChange,
      onChangeText,
      placeholder,
      prefixComponent,
      required,
      size = 'default',
      suffixComponent,
      sx,
      testID,
      ...props
    }: AllInputProps,
    ref,
  ) => {
    const internalId = useId();
    const id = baseID || internalId;
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
      <div
        className="fp-input-container"
        data-has-error={hasError}
        data-size={size}
        data-disabled={disabled}
      >
        {label && (
          <Label hasError={hasError} size={size} htmlFor={id}>
            {label}
          </Label>
        )}
        <InputContainer>
          {prefixComponent && (
            <PrefixContainer>{prefixComponent}</PrefixContainer>
          )}
          <StyledField
            {...props}
            $sx={sxStyles}
            aria-required={required}
            as={mask ? undefined : 'input'}
            className={`fp-input ${className}`}
            data-has-error={hasError}
            data-has-focus={hasFocus}
            data-size={size}
            data-testid={testID}
            disabled={disabled}
            id={id}
            onChange={handleChange}
            options={mask}
            placeholder={placeholder}
            required={required}
            tabIndex={0}
            // We use Cleave.js for mask, and cleave uses htmlRef instead of ref
            // These conditions are important in order to work with react-hook-forms
            ref={mask ? undefined : ref}
            htmlRef={mask ? ref : undefined}
          />
          {suffixComponent && (
            <SuffixContainer>{suffixComponent}</SuffixContainer>
          )}
        </InputContainer>
        {hint && <Hint hasError={hasError}>{hint}</Hint>}
      </div>
    );
  },
);

const InputContainer = styled.div`
  position: relative;
  width: inherit;
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

const StyledField = styled(Field)<{ $sx: SXStyles }>`
  ${({ theme }) => css`
    padding-left: ${theme.spacing[5]};
    padding-right: ${theme.spacing[5]};
  `}
  ${({ $sx }) =>
    css`
      ${$sx};
    `}
`;

export default BaseInput;
