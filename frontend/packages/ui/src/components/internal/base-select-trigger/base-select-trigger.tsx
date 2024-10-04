import { IcoChevronDown16 } from '@onefootprint/icons';
import type React from 'react';
import { forwardRef } from 'react';
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
      ...props
    }: BaseSelectTriggerProps,
    ref,
  ) => (
    <BaseSelectTriggerContainer
      data-has-error={hasError}
      data-has-focus={hasFocus}
      {...(isPrivate && { 'data-dd-privacy': 'mask' })}
      data-testid={testID}
      data-size={size}
      disabled={disabled}
      onClick={onClick}
      ref={ref}
      type="button"
      {...props}
      /** Do not change/remove these classes */
      className="fp-input fp-custom-appearance"
    >
      <Content data-testid={testID} {...(isPrivate && { 'data-dd-privacy': 'mask' })}>
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
      transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;

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
        &:not(:disabled):hover {
          background: ${input.state.default.hover.bg};
          border-color: ${input.state.default.hover.border};
        }

        &[data-has-focus='true'],
        &:not(:disabled):focus {
          background: ${input.state.default.focus.bg};
          border-color: ${input.state.default.focus.border};
          box-shadow: ${input.state.default.focus.elevation};
        }
      }

      &[data-has-error='true'] {
        background: ${input.state.error.initial.bg};
        border-color: ${input.state.error.initial.border};

        &:not(:disabled):hover {
          background: ${input.state.error.hover.bg};
          border-color: ${input.state.error.hover.border};
        }

        &:not(:disabled):focus {
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
