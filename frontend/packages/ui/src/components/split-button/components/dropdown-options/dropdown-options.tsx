import { IcoChevronDown16 } from '@onefootprint/icons';
import styled, { css } from 'styled-components';
import Dropdown from '../../../dropdown';

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
  <Dropdown.Root>
    <Trigger variant={variant} data-loading={loading} disabled={disabled} data-flat={flat} $width={$width}>
      <IcoChevronDown16 color={variant === 'primary' ? 'quinary' : 'primary'} />
    </Trigger>
    <Dropdown.Portal>
      <Dropdown.Content sideOffset={8} align="end" minWidth="186px">
        <Dropdown.Group>
          {options.map(option => (
            <Dropdown.Item key={option.value} onSelect={() => onOptionChange(option)}>
              {option.label}
            </Dropdown.Item>
          ))}
        </Dropdown.Group>
      </Dropdown.Content>
    </Dropdown.Portal>
  </Dropdown.Root>
);

const Trigger = styled(Dropdown.Trigger)<{
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
