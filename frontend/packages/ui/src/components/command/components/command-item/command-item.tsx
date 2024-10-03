import { Command as CommandPrimitive } from 'cmdk';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles } from '../../../../utils/mixins';

type CommandItemProps = ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & {
  disabled?: boolean;
};

const CommandItem = forwardRef<HTMLDivElement, CommandItemProps>(({ className, disabled, ...props }, ref) => (
  <StyledCommandPrimitiveItem ref={ref} className={className} data-disabled={disabled} {...props} />
));

const StyledCommandPrimitiveItem = styled(CommandPrimitive.Item)`
  ${({ theme, disabled }) => css`
    ${createFontStyles('body-3')}
    color: ${disabled ? theme.color.quaternary : theme.color.primary};
    padding: ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    cursor: pointer;
    justify-content: space-between;

    a {
      all: unset;
    }

    &[data-selected='true'] {
      background-color: ${theme.backgroundColor.secondary};
    }

    &[aria-disabled='true'] {
      pointer-events: none;
      color: ${theme.color.quaternary};
      cursor: not-allowed;
    }
  `}
`;

export default CommandItem;
