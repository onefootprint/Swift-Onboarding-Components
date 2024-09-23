import { Command as CommandPrimitive } from 'cmdk';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styled, { css } from 'styled-components';

type CommandSeparatorProps = ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>;

const CommandSeparator = forwardRef<HTMLDivElement, CommandSeparatorProps>(({ className, ...props }, ref) => (
  <StyledCommandPrimitiveSeparator ref={ref} className={className} {...props} />
));

const StyledCommandPrimitiveSeparator = styled(CommandPrimitive.Separator)`
  ${({ theme }) => css`
    height: ${theme.borderWidth[1]};
    background-color: ${theme.borderColor.tertiary};
    width: 100%;
  `}
`;

export default CommandSeparator;
