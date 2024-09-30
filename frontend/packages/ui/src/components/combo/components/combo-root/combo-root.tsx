import * as Popover from '@radix-ui/react-popover';
import type React from 'react';
import styled from 'styled-components';

type ComboRootProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ComboRoot = ({ children, open, onOpenChange }: ComboRootProps) => {
  return (
    <StyledPopoverRoot open={open} onOpenChange={onOpenChange}>
      {children}
    </StyledPopoverRoot>
  );
};

const StyledPopoverRoot = styled(Popover.Root)`
  isolation: isolate;
`;

export default ComboRoot;
