import type { PublicOnboardingConfig } from '@onefootprint/types';
import React from 'react';

import BifrostBottomSheet from './components/idv-bottom-sheet/idv-bottom-sheet';
import WhatsThisContent from './components/whats-this-content';

export type WhatsThisBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  closeAriaLabel?: string;
  config?: PublicOnboardingConfig;
  containerId?: string;
};

const WhatsThisBottomSheet = ({
  open,
  onClose,
  closeAriaLabel = 'Close',
  config,
  containerId,
}: WhatsThisBottomSheetProps) => (
  <BifrostBottomSheet
    open={open}
    onClose={onClose}
    closeAriaLabel={closeAriaLabel}
    containerId={containerId}
  >
    <WhatsThisContent config={config} />
  </BifrostBottomSheet>
);

export default WhatsThisBottomSheet;
