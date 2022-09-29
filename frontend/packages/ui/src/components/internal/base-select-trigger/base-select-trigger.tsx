import { IcoChevronDown16 } from '@onefootprint/icons';
import { BorderColor } from '@onefootprint/themes';
import { darken, rgba } from 'polished';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../utils/mixins';

type BaseSelectTriggerProps = {
  children: React.ReactNode;
  disabled?: boolean;
  hasError?: boolean;
  hasFocus?: boolean;
  onClick?: () => void;
};

const BaseSelectTrigger = forwardRef<HTMLButtonElement, BaseSelectTriggerProps>(
  (
    { children, disabled, hasError, hasFocus, onClick }: BaseSelectTriggerProps,
    ref,
  ) => (
    <BaseSelectTriggerContainer
      disabled={disabled}
      hasError={hasError}
      hasFocus={hasFocus}
      onClick={onClick}
      ref={ref}
      type="button"
    >
      <Content>{children}</Content>
      <IcoChevronDown16 />
    </BaseSelectTriggerContainer>
  ),
);

const createFocusStyle = (borderColor: BorderColor) => css`
  ${({ theme }) => css`
    border-color: ${theme.borderColor[borderColor]};
    box-shadow: 0 0 0 4px ${rgba(theme.borderColor[borderColor], 0.1)};
  `}
`;

const BaseSelectTriggerContainer = styled.button<BaseSelectTriggerProps>`
  ${({ hasError, hasFocus, theme }) => {
    const defaultBorderColor = hasError ? 'error' : 'primary';
    const hoverBorderColor = hasError ? 'error' : 'primary';
    const focusBorderColor = hasError ? 'error' : 'secondary';

    return css`
      ${createFontStyles('body-3')};
      align-items: center;
      background: ${theme.backgroundColor.primary};
      border-radius: ${theme.borderRadius[2]}px;
      border: 1px solid ${theme.borderColor[defaultBorderColor]};
      color: ${theme.color.primary};
      display: flex;
      height: 40px;
      justify-content: space-between;
      outline: none;
      padding: 0 ${theme.spacing[5]}px;
      text-align: left;
      width: 100%;

      ${!hasFocus &&
      css`
        &:hover:enabled {
          border: 1px solid
            ${hoverBorderColor === 'error'
              ? darken(0.1, theme.borderColor[hoverBorderColor])
              : darken(0.32, theme.borderColor[hoverBorderColor])};
        }
      `}

      &:focus:enabled {
        ${createFocusStyle(focusBorderColor)}
      }

      ${hasFocus && createFocusStyle(focusBorderColor)}

      &:disabled {
        background: ${theme.backgroundColor.secondary};
        color: ${theme.color.quaternary};
        cursor: not-allowed;
      }
    `;
  }}
`;

const Content = styled.span`
  display: flex;
  align-items: center;
`;

export default BaseSelectTrigger;
