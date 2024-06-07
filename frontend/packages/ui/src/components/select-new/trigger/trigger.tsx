import { IcoChevronDown16 } from '@onefootprint/icons';
import * as Select from '@radix-ui/react-select';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../utils';
import type { SelectNewProps, TriggerProps } from '../select-new.types';

const Trigger = ({
  size,
  disabled,
  placeholder,
  triggerWidth,
  ariaLabel,
  className,
}: TriggerProps & { className?: string }) => (
  <StyledTrigger size={size} width={triggerWidth} aria-label={ariaLabel} className={className}>
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
      border-radius: ${input.global.borderRadius};
      border: ${input.global.borderWidth} solid
        ${input.state.default.initial.border};
      width: ${width};
      gap: ${theme.spacing[2]};

      ${IconContainer} {
        transition: transform 0.1s ease;
      }

      &[data-state='open'] {
        ${IconContainer} {
          transform: rotate(180deg);
        }
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

      ${
        size === 'compact' &&
        css`
        ${createFontStyles('body-4')}
        height: ${input.size.compact.height};
        padding: ${theme.spacing[2]} ${theme.spacing[3]};
      `
      }

      ${
        size === 'default' &&
        css`
        ${createFontStyles('body-3')}
        height: ${input.size.default.height};
        padding: ${theme.spacing[3]} ${theme.spacing[4]};
      `
      }
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
