import { Command as CommandPrimitive } from 'cmdk';
import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import styled, { css } from 'styled-components';
import { createFontStyles } from '../../../../utils/mixins';

type CommandEmptyProps = ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>;

const CommandEmpty = forwardRef<HTMLDivElement, CommandEmptyProps>(({ children, ...props }, ref) => (
  <StyledCommandPrimitiveEmpty ref={ref} {...props}>
    {children}
  </StyledCommandPrimitiveEmpty>
));

const StyledCommandPrimitiveEmpty = styled(CommandPrimitive.Empty)`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: ${theme.color.tertiary};
    padding: ${theme.spacing[5]};
    text-align: center;
  `}
`;

export default CommandEmpty;
