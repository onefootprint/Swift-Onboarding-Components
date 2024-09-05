import styled, { css } from 'styled-components';

import { IcoChevronDown16 } from '@onefootprint/icons';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';

import type { TriggerProps } from '../dropdown.types';

const DropdownTrigger = ({ children, variant = 'default', ...props }: TriggerProps) => {
  switch (variant) {
    case 'chevron':
      return (
        <ChevronTriggerContainer {...props}>
          {children}
          <IcoChevronDown16 className="chevronContainer" />
        </ChevronTriggerContainer>
      );
    case 'icon':
      return <IconTriggerContainer {...props}>{children}</IconTriggerContainer>;
    default:
      return <DefaultTriggerContainer {...props}>{children}</DefaultTriggerContainer>;
  }
};

const IconTriggerContainer = styled(RadixDropdown.Trigger)`
  ${({ theme }) => css`
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
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
      cursor: initial;
      opacity: 0.5;
    }
  `}
`;

const ChevronTriggerContainer = styled(RadixDropdown.Trigger)`
  ${({ theme }) => css`
    all: unset;
    position: relative;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width: fit-content;
    
    .chevronContainer {
      color: ${theme.color.primary};
      transition: transform 0.1s ease;
      display: flex;
      align-items: center;
      justify-content: center;
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
      cursor: initial;
      opacity: 0.5;
    }
  `}
`;

const DefaultTriggerContainer = styled(RadixDropdown.Trigger)`
  ${({ theme }) => css`
    all: unset;
    cursor: pointer;
    color: ${theme.color.primary};

    &:not([data-disabled])[data-state='closed']:hover {
      color: ${theme.color.secondary};
    }

    &[data-disabled] {
      cursor: initial;
      opacity: 0.5;
    }
  `}
`;

export default DropdownTrigger;
