import { IcoChevronDown16 } from '@onefootprint/icons';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import styled, { css } from 'styled-components';

import Text from '../../text';
import type { TriggerProps } from '../dropdown.types';

const DropdownTrigger = ({ children, variant = 'default', ...props }: TriggerProps) => {
  switch (variant) {
    case 'chevron':
      return (
        <ChevronTriggerContainer {...props}>
          <Text variant="body-3" truncate>
            {children}
          </Text>
          <IcoChevronDown16 className="chevronContainer" />
        </ChevronTriggerContainer>
      );
    case 'icon':
      return <IconTriggerContainer {...props}>{children}</IconTriggerContainer>;
    default:
      return <DefaultTriggerContainer {...props}>{children}</DefaultTriggerContainer>;
  }
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

const IconTriggerContainer = styled(RadixDropdown.Trigger)`
  ${({ theme }) => css`
    ${baseTriggerStyles}
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.color.primary};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    flex-shrink: 0;
    width: ${theme.spacing[7]};
    height: ${theme.spacing[7]};

    &:not([data-disabled])[data-state='closed']:hover {
      color: ${theme.color.secondary};
      background-color: ${theme.backgroundColor.secondary};
    }

    &[data-disabled] {
      ${disabledStyles}
    }
  `}
`;

const ChevronTriggerContainer = styled(RadixDropdown.Trigger)`
  ${({ theme }) => css`
    ${baseTriggerStyles}
    display: flex;
    gap: ${theme.spacing[1]};
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;

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
