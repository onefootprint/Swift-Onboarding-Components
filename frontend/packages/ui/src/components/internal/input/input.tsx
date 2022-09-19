import { CleaveOptions } from 'cleave.js/options';
import React, { forwardRef, InputHTMLAttributes } from 'react';
import styled, { css } from 'styled-components';
import { FontVariant } from 'themes';

import useSx, { SXStyleProps, SXStyles } from '../../../hooks/use-sx';
import Field, { FieldProps } from '../field';
import Hint from '../hint';
import Label from '../label';

export type InternalInputProps = {
  prefixComponent?: React.ReactNode;
  suffixComponent?: React.ReactNode;
  fontVariant?: FontVariant;
};

export type InputProps = FieldProps & {
  value?: string;
  mask?: CleaveOptions;
  sx?: SXStyleProps;
} & InputHTMLAttributes<HTMLInputElement>;

type AllInputProps = InputProps & InternalInputProps;

const BaseInput = forwardRef<HTMLInputElement, AllInputProps>(
  (
    {
      fontVariant = 'body-3',
      hasError,
      hasFocus,
      hint,
      id: baseID,
      label,
      mask,
      onChange,
      onChangeText,
      placeholder,
      prefixComponent,
      required,
      suffixComponent,
      sx,
      testID,
      ...props
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
      <div>
        {label && <Label htmlFor={id}>{label}</Label>}
        <InputContainer>
          {prefixComponent && (
            <PrefixContainer>{prefixComponent}</PrefixContainer>
          )}
          <StyledField
            {...props}
            $hasError={hasError}
            $hasFocus={hasFocus}
            $sx={sxStyles}
            aria-required={required}
            as={mask ? undefined : 'input'}
            data-testid={testID}
            fontVariant={fontVariant}
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
        {hint && <Hint color={hasError ? 'error' : 'tertiary'}>{hint}</Hint>}
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

const StyledField = styled(Field)<{ $sx: SXStyles }>`
  ${({ theme }) => css`
    padding-left: ${theme.spacing[5]}px;
    padding-right: ${theme.spacing[5]}px;
  `}
  ${({ $sx }) =>
    css`
      ${$sx};
    `}
`;

export default BaseInput;
