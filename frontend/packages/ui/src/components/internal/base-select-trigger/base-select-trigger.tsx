import { IcoChevronDown16 } from '@onefootprint/icons';
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
      data-has-error={hasError}
      data-has-focus={hasFocus}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type="button"
    >
      <Content>{children}</Content>
      <IcoChevronDown16 />
    </BaseSelectTriggerContainer>
  ),
);

const BaseSelectTriggerContainer = styled.button<BaseSelectTriggerProps>`
  ${({ theme }) => {
    const { input } = theme.components;

    return css`
      ${createFontStyles('body-3')};
      align-items: center;
      background: ${input.state.default.initial.bg};
      border-color: ${input.state.default.initial.border};
      border-radius: ${input.global.borderRadius};
      border-style: solid;
      border-width: ${input.global.borderWidth};
      color: ${input.global.color};
      display: flex;
      height: ${input.size.default.height};
      justify-content: space-between;
      outline: none;
      padding: 0 ${theme.spacing[5]};
      text-align: left;
      width: 100%;

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

const Content = styled.span`
  display: flex;
  align-items: center;
`;

export default BaseSelectTrigger;
