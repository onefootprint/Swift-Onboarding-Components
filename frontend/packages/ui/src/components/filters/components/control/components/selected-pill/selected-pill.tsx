import { IcoChevronDown16 } from '@onefootprint/icons';
import React from 'react';

import type { PillProps } from '../pill';
import Pill from '../pill';

const SelectedPill = ({
  'aria-controls': ariaControls,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
  children,
  disabled,
  onClick,
}: PillProps) => (
  <Pill
    aria-controls={ariaControls}
    aria-expanded={ariaExpanded}
    aria-haspopup={ariaHaspopup}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    {children}
    <IcoChevronDown16 color="tertiary" />
  </Pill>
);

export default SelectedPill;
