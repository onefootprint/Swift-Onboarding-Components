'use client';

import type { ReactNode } from 'react';
import type React from 'react';
import { forwardRef, useId, useRef } from 'react';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import Stack from '../stack';
import { createCheckedStyled, createPseudoStyles } from './checkbox.utils';

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  hint?: string;
  id?: string;
  label?: ReactNode;
  name?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  readOnly?: boolean;
  required?: boolean;
  testID?: string;
  value?: string;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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
    }: CheckboxProps,
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const internalId = useId();
    const id = possibleId || internalId;

    return (
      <Stack direction="column">
        <Label aria-describedby={hint && `${id}-hint`} data-testid={testID} hasError={hasError} htmlFor={id}>
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
            ref={mergeRefs([inputRef, ref])}
            required={required}
            tabIndex={disabled ? undefined : 0}
            type="checkbox"
            value={value}
          />
          <LabelText>{label}</LabelText>
        </Label>
        {hint && (
          <Hint
            data-has-error={hasError}
            id={`${id}-hint`}
            onClick={() => {
              inputRef.current?.click();
            }}
          >
            {hint}
          </Hint>
        )}
      </Stack>
    );
  },
);

const Label = styled.label<Pick<CheckboxProps, 'hasError'>>`
  ${({ theme, hasError }) => css`
    ${createFontStyles('body-2')};
    align-items: center;
    color: ${hasError ? theme.color.error : theme.color.primary};
    display: inline-flex;
    gap: ${theme.spacing[4]};
  `}
`;

const LabelText = styled.span`
  display: flex;
  align-items: center;
`;

const Input = styled.input<Pick<CheckboxProps, 'hasError'>>`
  ${({ theme }) => css`
    appearance: none;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    display: grid;
    height: 16px;
    margin: 0;
    outline-offset: ${theme.spacing[2]};
    place-content: center;
    width: 16px;
    min-width: 16px;

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

const Hint = styled.div`
  ${({ theme }) => {
    const { hint } = theme.components;

    return css`
      ${createFontStyles('body-3')};
      color: ${hint.states.default.color};
      margin-left: calc(${theme.spacing[8]} - ${theme.spacing[2]});
      margin-top: ${theme.spacing[1]};
      text-align: left;

      &[data-has-error='true'] {
        color: ${hint.states.error.color};
      }
    `;
  }}
`;

export default Checkbox;
