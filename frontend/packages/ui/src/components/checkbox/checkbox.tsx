import React, { forwardRef } from 'react';
import styled, { css } from 'styled';

import { createFontStyles } from '../../utils/mixins';
import Hint from '../internal/hint';
import { createCheckedStyled, createPseudoStyles } from './checkbox.utils';

export type CheckboxProps = {
  checked?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  hintText?: string;
  id?: string;
  label: string;
  name?: string;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  required?: boolean;
  testID?: string;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      disabled,
      hasError,
      hintText,
      id: baseID,
      label,
      name,
      onBlur,
      onChange,
      readOnly,
      required,
      testID,
    }: CheckboxProps,
    ref,
  ) => {
    const id = `checkbox-${baseID || label}`;
    return (
      <Container>
        <Label
          aria-describedby={hintText && `${id}-hint`}
          data-testid={testID}
          hasError={hasError}
          htmlFor={id}
        >
          <Input
            aria-checked={checked}
            aria-disabled={disabled}
            aria-required={required}
            checked={checked}
            disabled={disabled}
            hasError={hasError}
            id={id}
            name={name}
            onBlur={onBlur}
            onChange={onChange}
            readOnly={readOnly}
            ref={ref}
            required={required}
            tabIndex={disabled ? undefined : 0}
            type="checkbox"
          />
          {label}
        </Label>
        {hintText && (
          <StyledHint
            color={hasError ? 'error' : 'tertiary'}
            id={`${id}-hint`}
            variant="body-3"
          >
            {hintText}
          </StyledHint>
        )}
      </Container>
    );
  },
);

const Container = styled.div`
  ${({ theme }) => css`
    &:not(:last-child) {
      margin-bottom: ${theme.spacing[3]}px;
    }
  `}
`;

const Label = styled.label<Pick<CheckboxProps, 'hasError'>>`
  ${({ theme, hasError }) => css`
    ${createFontStyles('body-3')};
    align-items: center;
    color: ${hasError ? theme.color.error : theme.color.primary};
    display: inline-flex;
    gap: ${theme.spacing[4]}px;
  `}
`;

const Input = styled.input<Pick<CheckboxProps, 'hasError'>>`
  ${({ theme }) => css`
    appearance: none;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.spacing[2]}px;
    border: ${theme.borderWidth[1]}px solid ${theme.borderColor.primary};
    display: grid;
    height: 16px;
    margin: 0;
    outline-offset: ${theme.spacing[2]}px;
    place-content: center;
    width: 16px;

    &::before {
      content: '';
      width: 0.55em;
      height: 0.55em;
      transform: scale(0);
      transition: 100ms transform ease-in-out;
    }

    &:checked {
      background-color: ${theme.backgroundColor.tertiary};
      border-color: transparent;
      ${createPseudoStyles({
        hoverOverlay: 'lighten-1',
        activeOverlay: 'lighten-2',
        background: 'tertiary',
      })}

      &::before {
        ${createCheckedStyled('quinary')};
      }
    }

    &:disabled {
      background-color: ${theme.backgroundColor.senary};
      border-color: transparent;
      cursor: not-allowed;

      &:checked::before {
        ${createCheckedStyled('quaternary')};
      }
    }
  `}

  ${({ hasError, theme }) => {
    if (hasError) {
      return css`
        border-color: ${theme.borderColor.error};
        ${createPseudoStyles({
          hoverOverlay: 'error-1',
          activeOverlay: 'error-2',
          background: 'primary',
        })}
      `;
    }

    return css`
      ${createPseudoStyles({
        hoverOverlay: 'darken-1',
        activeOverlay: 'darken-2',
        background: 'primary',
      })}
    `;
  }}
`;

const StyledHint = styled(Hint)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[2]}px;
    // This subtraction is required because of the checkbox borders
    margin-left: ${theme.spacing[8] - theme.spacing[1]}px;
  `}
`;

export default Checkbox;
