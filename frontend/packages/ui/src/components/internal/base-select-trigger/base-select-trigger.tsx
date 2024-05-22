import { IcoChevronDown16 } from '@onefootprint/icons';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';

import { createText } from '../../../utils/mixins';
import Stack from '../../stack';

type BaseSelectTriggerProps = {
  children: React.ReactNode | string;
  disabled?: boolean;
  hasError?: boolean;
  hasFocus?: boolean;
  isPrivate?: boolean;
  onClick?: () => void;
  size?: 'compact' | 'default';
  testID?: string;
  hasIcon?: boolean;
};

const BaseSelectTrigger = forwardRef<HTMLButtonElement, BaseSelectTriggerProps>(
  (
    {
      children,
      disabled,
      hasError,
      hasFocus,
      isPrivate,
      onClick,
      size,
      testID,
      hasIcon,
    }: BaseSelectTriggerProps,
    ref,
  ) => (
    <BaseSelectTriggerContainer
      data-has-error={hasError}
      data-has-focus={hasFocus}
      data-private={isPrivate}
      data-dd-privacy={isPrivate ? 'mask' : 'allow'}
      data-testid={testID}
      data-size={size}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type="button"
      /** Do not change/remove these classes */
      className="fp-input fp-custom-appearance"
    >
      <Content
        data-private={isPrivate}
        data-dd-privacy={isPrivate ? 'mask' : 'allow'}
        data-testid={testID}
      >
        {hasIcon ? children : <Text>{children}</Text>}
      </Content>
      <Stack align="center" justify="center" marginLeft={4}>
        <IcoChevronDown16 color={disabled ? 'tertiary' : 'primary'} />
      </Stack>
    </BaseSelectTriggerContainer>
  ),
);

const Text = styled.p`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const BaseSelectTriggerContainer = styled.button<BaseSelectTriggerProps>`
  ${({ theme }) => {
    const { input } = theme.components;

    return css`
      align-items: center;
      background: ${input.state.default.initial.bg};
      border-color: ${input.state.default.initial.border};
      border-radius: ${input.global.borderRadius};
      border-style: solid;
      border-width: ${input.global.borderWidth};
      color: ${input.global.color};
      display: flex;
      justify-content: space-between;
      outline: none;
      text-align: left;
      width: 100%;

      &[data-size='default'] {
        ${createText(input.size.default.typography)};
        height: ${input.size.default.height};
        padding: 0 ${theme.spacing[5]};
      }

      &[data-size='compact'] {
        ${createText(input.size.compact.typography)};
        height: ${input.size.compact.height};
        padding: 0 ${theme.spacing[4]};
      }

      &[data-has-error='false'] {
        @media (hover: hover) {
          &:enabled:hover {
            background: ${input.state.default.hover.bg};
            border-color: ${input.state.default.hover.border};
          }
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

        @media (hover: hover) {
          &:enabled:hover {
            background: ${input.state.error.hover.bg};
            border-color: ${input.state.error.hover.border};
          }
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
        color: ${input.state.disabled.color};
      }
    `;
  }}
`;

const Content = styled.span`
  display: flex;
  align-items: center;
  max-width: calc(100% - 28px); // Minus the width of the icon + margin
  overflow: hidden;
`;

export default BaseSelectTrigger;
