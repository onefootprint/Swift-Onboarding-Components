import { GetToggleButtonPropsOptions } from 'downshift';
import IcoChevronDown16 from 'icons/ico/ico-chevron-down-16';
import { darken, rgba } from 'polished';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import type { Color } from 'themes';

import { createFontStyles } from '../../../../utils/mixins';

export type TriggerButtonProps = {
  children: string;
  color: Color;
  disabled?: boolean;
  getToggleButtonProps: (
    options?: GetToggleButtonPropsOptions | undefined,
  ) => any;
  hasError?: boolean;
  id: string;
  isOpen?: boolean;
};

const TriggerButton = forwardRef<HTMLButtonElement, TriggerButtonProps>(
  (
    {
      children,
      color,
      disabled,
      getToggleButtonProps,
      hasError,
      id,
      isOpen,
    }: TriggerButtonProps,
    ref,
  ) => {
    const {
      'aria-haspopup': ariaHasPopup,
      'aria-label': ariaLabel,
      'data-toggle': dataToggle,
      onBlur,
      onClick,
      onKeyDown,
      onKeyUp,
      role,
      type,
    } = getToggleButtonProps({ disabled });
    return (
      <Button
        aria-haspopup={ariaHasPopup}
        aria-label={ariaLabel}
        color={color}
        data-toggle={dataToggle}
        disabled={disabled}
        hasError={hasError}
        id={id}
        isOpen={isOpen}
        onBlur={onBlur}
        onClick={onClick}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        ref={ref}
        role={role}
        type={type}
      >
        {children}
        <IcoChevronDown16 />
      </Button>
    );
  },
);

const Button = styled.button<{
  hasError?: boolean;
  isOpen?: boolean;
  color: Color;
}>`
  ${({ color, hasError, theme }) => {
    const defaultBorderColor = hasError ? 'error' : 'primary';
    const hoverBorderColor = hasError ? 'error' : 'primary';
    const focusBorderColor = hasError ? 'error' : 'secondary';
    return css`
      ${createFontStyles('body-3')}
      align-items: center;
      background-color: ${theme.backgroundColor.primary};
      border-radius: ${theme.borderRadius[1]}px;
      border: ${theme.borderWidth[1]}px solid
        ${theme.borderColor[defaultBorderColor]};
      color: ${theme.color[color]};
      cursor: pointer;
      display: flex;
      height: 40px;
      justify-content: space-between;
      outline: none;
      padding: 0 ${theme.spacing[5]}px;
      text-align: left;
      width: 100%;

      &:hover:enabled {
        border-color: ${hoverBorderColor === 'error'
          ? darken(0.1, theme.borderColor[hoverBorderColor])
          : darken(0.32, theme.borderColor[hoverBorderColor])};
      }

      &:focus:enabled {
        -webkit-appearance: none;
        border-color: ${theme.borderColor[focusBorderColor]};
        box-shadow: 0 0 0 4px ${rgba(theme.borderColor[focusBorderColor], 0.1)};
      }

      &:disabled {
        background: ${theme.backgroundColor.secondary};
        color: ${theme.color.tertiary};
        cursor: not-allowed;
      }
    `;
  }}

  ${({ hasError, isOpen, theme }) => {
    if (!isOpen) {
      return css``;
    }

    const focusBorderColor = hasError ? 'error' : 'secondary';
    return css`
      -webkit-appearance: none;
      border-color: ${theme.borderColor[focusBorderColor]};
      box-shadow: 0 0 0 4px ${rgba(theme.borderColor[focusBorderColor], 0.1)};

      &:hover:enabled {
        border-color: ${theme.borderColor[focusBorderColor]};
      }
    `;
  }}
`;

export default TriggerButton;
