import { Command as CommandPrimitive } from 'cmdk';
import * as React from 'react';
import styled, { css } from 'styled-components';

type CommandListProps = React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>;

const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, CommandListProps>(
  ({ className, ...props }, ref) => <ListContainer ref={ref} className={className} {...props} />,
);

const ListContainer = styled(CommandPrimitive.List)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]};
    max-height: 480px;
    overflow-y: auto;
  `}
`;

export default CommandList;
