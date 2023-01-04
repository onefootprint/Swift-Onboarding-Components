import { IcoChevronDown16 } from '@onefootprint/icons';
import React from 'react';

import Pill, { PillProps } from '../pill';

const SelectedPill = ({
  children,
  onClick,
  'aria-controls': ariaControls,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHaspopup,
}: PillProps) => (
  <Pill
    onClick={onClick}
    type="button"
    aria-controls={ariaControls}
    aria-expanded={ariaExpanded}
    aria-haspopup={ariaHaspopup}
  >
    {children}
    <IcoChevronDown16 color="tertiary" />
  </Pill>
);

export default SelectedPill;
