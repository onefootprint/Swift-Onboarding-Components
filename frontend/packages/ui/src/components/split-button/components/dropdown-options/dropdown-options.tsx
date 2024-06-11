import { IcoChevronDown16 } from '@onefootprint/icons';
import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import React from 'react';
import styled, { css } from 'styled-components';

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
  flat?: boolean;
  $width: string;
};

const DropdownOptions = ({
  options,
  variant,
  loading,
  disabled,
  $width,
  flat = false,
  onOptionChange,
}: DropdownOptionsProps) => (
  <DropdownPrimitive.Root>
    <Trigger variant={variant} data-loading={loading} disabled={disabled} data-flat={flat} $width={$width}>
      <IcoChevronDown16 color={variant === 'primary' ? 'quinary' : 'primary'} />
    </Trigger>
    <DropdownContainer sideOffset={8} align="end">
      <DropdownPrimitive.Group>
        {options.map(option => (
          <Item key={option.value} onSelect={() => onOptionChange(option)}>
            {option.label}
          </Item>
        ))}
      </DropdownPrimitive.Group>
    </DropdownContainer>
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

const Item = styled(DropdownPrimitive.Item)`
  ${({ theme }) => {
    const { dropdown } = theme.components;

    return css`
      width: 100%;
      ${createFontStyles('body-3')}
      background-color: ${dropdown.bg};
      cursor: pointer;
      padding: ${theme.spacing[2]} ${theme.spacing[5]};
      border-radius: ${theme.borderRadius.sm};

      &:hover {
        background-color: ${dropdown.hover.bg};
      }

      &:focus {
        outline: none;
      }
    `;
  }}
`;

const Trigger = styled(DropdownPrimitive.Trigger)<{
  variant: ButtonVariant;
  $width: string;
}>`
  ${({ theme, variant, $width }) => {
    const { button } = theme.components;

    return css`
      all: unset;
      --animation-duration: 0.1s;
      --adapted-border-radius: calc(${button.borderRadius} - 1px);
      background-color: ${button.variant[variant].bg};
      border-radius: 0 var(--adapted-border-radius) var(--adapted-border-radius)
        0;
      color: ${button.variant[variant].color};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;
      height: 100%;
      outline-offset: ${theme.spacing[2]};
      position: relative;
      user-select: none;
      width: ${$width};
      transition: all 0.2s ease-in-out;

      &:hover:enabled {
        background-color: ${button.variant[variant].hover.bg};
        border-color: ${button.variant[variant].hover.borderColor};
        color: ${button.variant[variant].hover.color};
        box-shadow: ${button.variant[variant].hover.boxShadow};
      }

      &:active:enabled {
        background-color: ${button.variant[variant].active.bg};
        border-color: ${button.variant[variant].active.borderColor};
        color: ${button.variant[variant].active.color};
        box-shadow: ${button.variant[variant].active.boxShadow};
      }

      &:disabled {
        cursor: not-allowed;
        background-color: ${button.variant[variant].disabled.bg};
        border-color: ${button.variant[variant].disabled.borderColor};
        color: ${button.variant[variant].disabled.color};

        path {
          fill: ${button.variant[variant].disabled.color};
        }
      }

      &[data-flat='true'] {
        box-shadow: none;
      }

      &:not([data-flat='true']) {
        box-shadow: ${button.variant[variant]?.boxShadow};
        clip-path: inset(-9999px -9999px -9999px 0);

        &:hover {
          z-index: 0;
          box-shadow: ${button.variant[variant].hover.boxShadow};
        }

        &:active {
          z-index: 0;
          box-shadow: ${button.variant[variant].active.boxShadow};
        }

        &:disabled {
          box-shadow: ${button.variant[variant].disabled.boxShadow};
        }
      }
    `;
  }}
`;

export default DropdownOptions;
