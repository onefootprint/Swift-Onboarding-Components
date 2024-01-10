import { IcoChevronDown16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import React from 'react';

import { createFontStyles } from '../../../../utils';
import type { ButtonVariant } from '../../split-button.types';

export type Option = {
  label: string;
  value: string;
  onSelect: () => void;
};

type DropdownOptionsProps = {
  options: Option[];
  variant: ButtonVariant;
  loading?: boolean;
  disabled: boolean;
  onOptionChange: (option: Option) => void;
};

const TRIGGER_WIDTH = '32px';

const DropdownOptions = ({
  options,
  variant,
  loading,
  disabled,
  onOptionChange,
}: DropdownOptionsProps) => (
  <DropdownPrimitive.Root>
    <Trigger variant={variant} data-loading={loading} disabled={disabled}>
      <Divider variant={variant} />
      <IcoChevronDown16 color={variant === 'primary' ? 'quinary' : 'primary'} />
    </Trigger>
    <DropdownPrimitive.Portal>
      <DropdownContainer sideOffset={8} align="end">
        <DropdownPrimitive.Group>
          {options.map(option => (
            <Item key={option.value} onSelect={() => onOptionChange(option)}>
              {option.label}
            </Item>
          ))}
        </DropdownPrimitive.Group>
      </DropdownContainer>
    </DropdownPrimitive.Portal>
  </DropdownPrimitive.Root>
);

const DropdownContainer = styled(DropdownPrimitive.Content)`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      background-color: ${dropdown.bg};
      box-shadow: ${dropdown.elevation};
      padding: ${theme.spacing[2]} ${theme.spacing[2]};
      border-radius: ${dropdown.borderRadius};
      border-color: ${dropdown.borderColor};
      border-style: solid;
      min-width: 186px;
    `;
  }}
`;

const Divider = styled.span<{ variant: ButtonVariant }>`
  ${({ theme, variant }) => css`
    position: absolute;
    height: 80%;
    left: 0;
    width: ${theme.borderWidth[1]};
    opacity: 0.3;
    background-color: ${variant === 'primary'
      ? theme.color.quinary
      : theme.color.tertiary};
  `}
`;

const Item = styled(DropdownPrimitive.Item)`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      width: 100%;
      ${createFontStyles('body-3')}
      background-color: ${dropdown.bg};
      cursor: pointer;
      padding: ${theme.spacing[2]} ${theme.spacing[5]};
      border-radius: ${theme.borderRadius.compact};

      &:hover {
        border: none;
        background-color: ${dropdown.hover.bg};
      }

      &:focus {
        border: none;
      }
    `;
  }}
`;

const Trigger = styled(DropdownPrimitive.Trigger)<{
  variant: ButtonVariant;
}>`
  ${({ theme, variant }) => {
    const { button } = theme.components;

    return css`
      all: unset;
      position: relative;
      background-color: ${button.variant[variant].bg};
      border-color: ${button.variant[variant].borderColor};
      color: ${button.variant[variant].color};
      border-radius: 0 ${button.borderRadius} ${button.borderRadius} 0;
      border-style: solid;
      border-width: ${button.borderWidth};
      height: 100%;
      width: ${TRIGGER_WIDTH};
      border-left: 0;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;

      @media (hover: hover) {
        &:hover:enabled {
          background-color: ${button.variant[variant].hover.bg};
          color: ${button.variant[variant].hover.color};
        }
      }

      &:active:enabled {
        background-color: ${button.variant[variant].active.bg};
        color: ${button.variant[variant].active.color};
      }

      &[data-loading='true'] {
        background-color: ${button.variant[variant].loading.bg};
        color: ${button.variant[variant].loading.color};
        pointer-event: none;

        path {
          fill: ${button.variant[variant].loading.color};
        }
      }

      &:disabled {
        cursor: initial;
        background-color: ${button.variant[variant].disabled.bg};
        color: ${button.variant[variant].disabled.color};

        path {
          fill: ${button.variant[variant].disabled.color};
        }
      }
    `;
  }}
`;

export default DropdownOptions;
