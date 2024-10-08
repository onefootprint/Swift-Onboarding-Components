import * as RadixDialog from '@radix-ui/react-dialog';
import { forwardRef } from 'react';
import Overlay from '../../overlay';

interface DialogOverlayProps {
  isVisible: boolean;
  isConfirmation: boolean;
}

const DialogOverlay = forwardRef<HTMLDivElement, DialogOverlayProps>(({ isVisible, isConfirmation }, ref) => (
  <RadixDialog.Overlay asChild>
    <Overlay ref={ref} isVisible={isVisible} isConfirmation={isConfirmation} />
  </RadixDialog.Overlay>
));

DialogOverlay.displayName = 'DialogOverlay';

export default DialogOverlay;
