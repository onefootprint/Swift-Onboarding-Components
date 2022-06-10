import { CleaveOptions } from 'cleave.js/options';
import Cleave from 'cleave.js/react';
import { darken, rgba } from 'polished';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../utils/mixins';

export type FieldProps = {
  hasError?: boolean;
  hintText?: string;
  label?: string;
  onChangeText?: (nextValue: string) => void;
  placeholder: string;
  testID?: string;
};

type FieldInternalProps = {
  htmlRef?: React.ForwardedRef<HTMLInputElement>;
  $hasError?: boolean;
  options?: CleaveOptions;
};

const Field = styled(Cleave).attrs<{ as?: 'textarea' | 'input' }>(({ as }) => ({
  as,
}))<FieldInternalProps>`
  ${({ $hasError, theme }) => {
    const defaultBorderColor = $hasError ? 'error' : 'primary';
    const hoverBorderColor = $hasError ? 'error' : 'primary';
    const focusBorderColor = $hasError ? 'error' : 'secondary';
    return css`
      ${createFontStyles('body-3')};
      background-color: ${theme.backgroundColor.primary};
      border-radius: ${theme.borderRadius[1]}px;
      border: ${theme.borderWidth[1]}px solid
        ${theme.borderColor[defaultBorderColor]};
      color: ${theme.color.primary};
      height: 40px;
      outline: none;
      width: 100%;

      &:hover:enabled {
        border: ${theme.borderWidth[1]}px solid
          ${hoverBorderColor === 'error'
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

      ::placeholder {
        color: ${theme.color.quaternary};
      }

      ::-webkit-credentials-auto-fill-button {
        visibility: hidden;
        pointer-events: none;
        position: absolute;
        right: 0;
      }
    `;
  }}
`;

export default Field;
