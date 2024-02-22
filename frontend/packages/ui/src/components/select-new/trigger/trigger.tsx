import { IcoChevronDown16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import * as Select from '@radix-ui/react-select';
import React from 'react';

import { createFontStyles } from '../../../utils';
import type { SelectNewProps, TriggerProps } from '../select-new.types';

const Trigger = ({
  size,
  disabled,
  placeholder,
  triggerWidth,
  ariaLabel,
}: TriggerProps) => (
  <StyledTrigger size={size} width={triggerWidth} aria-label={ariaLabel}>
    <ValueContainer>
      <Select.Value placeholder={placeholder} />
    </ValueContainer>
    <IconContainer>
      <IcoChevronDown16 color={disabled ? 'quaternary' : 'secondary'} />
    </IconContainer>
  </StyledTrigger>
);

const StyledTrigger = styled(Select.Trigger)<{
  size: SelectNewProps['size'];
  width: TriggerProps['triggerWidth'];
}>`
  ${({ theme, size, width = 'default' }) => {
    const { input } = theme.components;

    return css`
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: ${input.state.default.initial.bg};
      color: ${input.global.color};
      border-color: ${input.state.default.initial.border};
      border-radius: ${input.global.borderRadius};
      border: ${input.global.borderWidth} solid
        ${input.state.default.initial.border};

      ${IconContainer} {
        transition: transform 0.1s ease;
      }

      &[data-state='open'] {
        ${IconContainer} {
          transform: rotate(180deg);
        }
      }

      &:focus {
        outline: none;
        border-color: ${input.state.default.focus.border};
      }

      &:hover {
        border-color: ${input.state.default.hover.border};
      }

      &[data-placeholder='true'] {
        color: ${input.global.placeholderColor};
      }

      &[data-disabled] {
        background-color: ${input.state.disabled.bg};
        border-color: ${input.state.disabled.border};
        color: ${input.state.disabled.color};
      }

      ${size === 'compact' &&
      css`
        ${createFontStyles('body-4')}
        height: ${input.size.compact.height};
        padding: ${theme.spacing[2]} ${theme.spacing[3]};
      `}

      ${size === 'default' &&
      css`
        ${createFontStyles('body-3')}
        height: ${input.size.default.height};
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
      `}

      ${width === 'full' &&
      css`
        width: 100%;
      `}

      ${width === 'auto' &&
      css`
        width: auto;
      `}

      ${width === 'narrow' &&
      css`
        width: 120px;
      `}

      ${width === 'default' &&
      css`
        width: 300px;
      `}

      ${width === 'wide' &&
      css`
        width: 320px;
      `}
    `;
  }};
`;

const IconContainer = styled(Select.Icon)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ValueContainer = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export default Trigger;
