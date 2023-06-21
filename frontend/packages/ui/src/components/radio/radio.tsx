import styled, { css } from '@onefootprint/styled';
import React, { forwardRef, useId } from 'react';

import { createFontStyles } from '../../utils/mixins';
import InputHint from '../internal/hint';
import { createCheckedStyled, createPseudoStyles } from './radio.utils';

export type RadioProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  hint?: string;
  id?: string;
  label: string;
  name?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  required?: boolean;
  testID?: string;
  value?: any;
};

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      checked,
      defaultChecked,
      disabled,
      hasError,
      hint,
      id: possibleId,
      label,
      name,
      onBlur,
      onChange,
      readOnly,
      required,
      testID,
      value,
    }: RadioProps,
    ref,
  ) => {
    const internalId = useId();
    const id = possibleId || internalId;
    return (
      <Container>
        <Label
          aria-describedby={hint && `${id}-hint`}
          data-testid={testID}
          data-has-error={hasError}
          htmlFor={id}
        >
          <Input
            aria-checked={checked}
            aria-disabled={disabled}
            aria-required={required}
            checked={checked}
            defaultChecked={defaultChecked}
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
            type="radio"
            value={value}
          />
          {label}
        </Label>
        {hint && (
          <StyledInputHint hasError={hasError} id={`${id}-hint`} size="compact">
            {hint}
          </StyledInputHint>
        )}
      </Container>
    );
  },
);

const Container = styled.div``;

const Label = styled.label`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    align-items: center;
    color: ${theme.color.primary};
    display: inline-flex;
    gap: ${theme.spacing[4]};

    &[data-has-error='true'] {
      color: ${theme.color.error};
    }
  `}
`;

const Input = styled.input<Pick<RadioProps, 'hasError'>>`
  ${({ theme }) => css`
    appearance: none;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.spacing[4]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    display: grid;
    height: 16px;
    margin: 0;
    outline-offset: ${theme.spacing[2]};
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
      cursor: initial;
      background-color: ${theme.backgroundColor.senary};
      border-color: transparent;

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

const StyledInputHint = styled(InputHint)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[2]};
    margin-left: calc(${theme.spacing[8]} - ${theme.spacing[1]});
  `}
`;

export default Radio;
