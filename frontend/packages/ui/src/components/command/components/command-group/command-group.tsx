import { Command as CommandPrimitive } from 'cmdk';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles } from '../../../../utils/mixins';

type CommandGroupProps = ComponentPropsWithoutRef<typeof CommandPrimitive.Group>;

const CommandGroup = forwardRef<HTMLDivElement, CommandGroupProps>(({ className, ...props }, ref) => (
  <StyledCommandPrimitiveGroup ref={ref} className={className} {...props} />
));

const StyledCommandPrimitiveGroup = styled(CommandPrimitive.Group)`
  ${({ theme }) => css`
    &:not(:first-of-type) {
      margin-top: ${theme.spacing[2]};
    }

    [cmdk-group-heading] {
      ${createFontStyles('caption-1')}
      color: ${theme.color.quaternary};
      padding: ${theme.spacing[3]};
    }
  `}
`;

export default CommandGroup;
