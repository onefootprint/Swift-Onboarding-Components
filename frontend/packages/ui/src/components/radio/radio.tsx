'use client';

import React, { forwardRef, useId, useRef } from 'react';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import Grid from '../grid';
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
  value?: string;
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
    const inputRef = useRef<HTMLInputElement>(null);
    const internalId = useId();
    const id = possibleId || internalId;

    return (
      <Container>
        <Label aria-describedby={hint && `${id}-hint`} data-testid={testID} data-has-error={hasError} htmlFor={id}>
          <Input
            aria-checked={checked}
            aria-disabled={disabled}
            aria-required={required}
            as="input"
            checked={checked}
            data-has-error={hasError}
            defaultChecked={defaultChecked}
            disabled={disabled}
            id={id}
            name={name}
            onBlur={onBlur}
            onChange={onChange}
            readOnly={readOnly}
            ref={mergeRefs([inputRef, ref])}
            required={required}
            tabIndex={disabled ? undefined : 0}
            type="radio"
            value={value}
          />
          {label}
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

const Input = styled(Grid.Container)<Pick<RadioProps, 'hasError'>>`
  ${({ theme }) => css`
    appearance: none;
    position: relative;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.spacing[4]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.primary};
    height: 16px;
    margin: 0;
    outline-offset: ${theme.spacing[2]};
    place-content: center;
    min-width: 16px;

    &::before {
      content: '';
      width: 0.55em;
      height: 0.55em;
      transform: scale(0);
      transition: 100ms transform ease-in-out;
    }

    &:not(:checked):hover:enabled {
      background-color: ${theme.backgroundColor.secondary};
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

    &[data-has-error='false'] {
      ${createPseudoStyles({
        hoverOverlay: 'darken-1',
        activeOverlay: 'darken-2',
        background: 'primary',
      })}
    }

    &[data-has-error='true'] {
      border-color: ${theme.borderColor.error};
      ${createPseudoStyles({
        hoverOverlay: 'error-1',
        activeOverlay: 'error-2',
        background: 'primary',
      })}
    }
  `}
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
export default Radio;
