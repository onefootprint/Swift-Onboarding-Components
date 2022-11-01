import { CleaveOptions } from 'cleave.js/options';
import Cleave from 'cleave.js/react';
import React from 'react';
import styled, { css } from 'styled-components';

export type FieldProps = {
  hasError?: boolean;
  hasFocus?: boolean;
  hint?: string;
  label?: string;
  onChangeText?: (nextValue: string) => void;
  placeholder: string;
  size?: 'default' | 'compact';
  testID?: string;
};

type FieldInternalProps = {
  htmlRef?: React.ForwardedRef<HTMLInputElement>;
  options?: CleaveOptions;
};

const Field = styled(Cleave).attrs<{ as?: 'textarea' | 'input' }>(({ as }) => ({
  as,
}))<FieldInternalProps>`
  ${({ theme }) => {
    const {
      components: { input },
    } = theme;

    return css`
      background: ${input.state.default.initial.bg};
      border-color: ${input.state.default.initial.border};
      border-radius: ${input.global.borderRadius}px;
      border-style: solid;
      border-width: ${input.global.borderWidth}px;
      color: ${input.global.color};
      outline: none;
      width: 100%;

      &[data-size='default'] {
        font: ${input.size.default.typography};
        height: ${input.size.default.height}px;
      }

      &[data-size='compact'] {
        font: ${input.size.compact.typography};
        height: ${input.size.compact.height}px;
      }

      ::placeholder {
        color: ${input.global.placeholderColor};
      }

      ::-webkit-credentials-auto-fill-button {
        visibility: hidden;
        pointer-events: none;
        position: absolute;
        right: 0;
      }

      &[data-has-error='false'] {
        &:enabled:hover {
          background: ${input.state.default.hover.bg};
          border-color: ${input.state.default.hover.border};
        }

        &[data-has-focus='true'],
        &:enabled:focus {
          background: ${input.state.default.focus.bg};
          border-color: ${input.state.default.focus.border};
          box-shadow: ${input.state.default.focus.elevation};
        }
      }

      &[data-has-error='true'] {
        background: ${input.state.error.initial.bg};
        border-color: ${input.state.error.initial.border};

        &:enabled:hover {
          background: ${input.state.error.hover.bg};
          border-color: ${input.state.error.hover.border};
        }

        &:enabled:focus {
          background: ${input.state.error.focus.bg};
          border-color: ${input.state.error.focus.border};
          box-shadow: ${input.state.error.focus.elevation};
        }
      }

      &:disabled {
        background: ${input.state.disabled.bg};
        border-color: ${input.state.disabled.border};
      }
    `;
  }}
`;

export default Field;
