import { IcoChevronDown16 } from '@onefootprint/icons';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import type * as CSS from 'csstype';
import styled, { css } from 'styled-components';

import Text from '../../text';
import type { TriggerProps } from '../dropdown.types';

const DropdownTrigger = ({ children, variant = 'default', maxWidth, ...props }: TriggerProps) => {
  if (variant === 'chevron') {
    return (
      <ChevronTriggerContainer {...props}>
        <Text variant="body-3" truncate>
          {children}
        </Text>
        <IcoChevronDown16 className="chevronContainer" />
      </ChevronTriggerContainer>
    );
  }
  return <DefaultTriggerContainer {...props}>{children}</DefaultTriggerContainer>;
};

const baseTriggerStyles = css`
  all: unset;
  cursor: pointer;
  position: relative;
`;

const disabledStyles = css`
  cursor: initial;
  opacity: 0.5;
`;

const ChevronTriggerContainer = styled(RadixDropdown.Trigger)<{ maxWidth?: CSS.Property.Width }>`
  ${({ theme, maxWidth }) => css`
    ${baseTriggerStyles}
    display: flex;
    gap: ${theme.spacing[1]};
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: ${maxWidth};

    .chevronContainer {
      color: ${theme.color.primary};
      transition: transform 0.1s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    &:not([data-disabled])[data-state='closed']:hover {
      color: ${theme.color.secondary};

      .chevronContainer {
        color: ${theme.color.secondary};
      }
    }

    &:not([data-disabled])[data-state='open'] {
      color: ${theme.color.primary};

      .chevronContainer {
        transform: rotate(180deg);
      }
    }

    &[data-disabled] {
      ${disabledStyles}
    }
  `}
`;

const DefaultTriggerContainer = styled(RadixDropdown.Trigger)`
  ${({ theme }) => css`
    ${baseTriggerStyles}
    color: ${theme.color.primary};

    &:not([data-disabled])[data-state='closed']:hover {
      color: ${theme.color.secondary};
    }

    &[data-disabled] {
      ${disabledStyles}
    }
  `}
`;

export default DropdownTrigger;
