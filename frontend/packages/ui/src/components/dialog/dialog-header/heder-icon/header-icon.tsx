import { IcoClose24 } from '@onefootprint/icons';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import React from 'react';

import IconButton from '../../../icon-button';
import type { DialogHeaderIcon } from '../../dialog.types';

const HeaderIcon = ({
  component: IconComponent = IcoClose24,
  onClick,
  ariaLabel,
}: DialogHeaderIcon) => (
  <DialogPrimitive.Close asChild>
    <IconButton onClick={onClick} aria-label={ariaLabel || 'Close'}>
      <IconComponent />
    </IconButton>
  </DialogPrimitive.Close>
);
export default HeaderIcon;
