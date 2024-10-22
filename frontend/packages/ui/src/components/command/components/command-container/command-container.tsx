import { Command } from 'cmdk';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import Overlay from '../../../overlay';

type CommandDialogProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: 'popper' | 'fixed';
};

const CommandContainer = forwardRef<HTMLDivElement, CommandDialogProps>(
  ({ children, open, onOpenChange, position = 'fixed' }, ref) => {
    return (
      <>
        <Overlay isVisible={open} />
        <DialogContainer open={open} onOpenChange={onOpenChange} position={position}>
          <Command ref={ref}>{children}</Command>
        </DialogContainer>
      </>
    );
  },
);

const DialogContainer = styled(Command.Dialog)<{ position?: 'popper' | 'fixed' }>`
  ${({ theme, position }) => css`
    z-index: ${theme.zIndex.dialog};
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[2]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
    width: 600px;

    ${
      position === 'fixed' &&
      css`
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
      `
    }
  `}  
`;

export default CommandContainer;
