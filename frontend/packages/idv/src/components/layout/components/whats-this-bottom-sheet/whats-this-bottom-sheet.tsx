import type { PublicOnboardingConfig } from '@onefootprint/types';
import { BottomSheet } from '@onefootprint/ui';

import { FOOTPRINT_FOOTER_ID } from '../../constants';
import WhatsThisContent from './components/whats-this-content';

export type WhatsThisBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  closeAriaLabel?: string;
  config?: PublicOnboardingConfig;
  portalId?: string;
  containerId?: string;
};

const WhatsThisBottomSheet = ({
  open,
  onClose,
  closeAriaLabel = 'Close',
  config,
  portalId = FOOTPRINT_FOOTER_ID,
  containerId,
}: WhatsThisBottomSheetProps) => (
  <BottomSheet
    open={open}
    onClose={onClose}
    closeAriaLabel={closeAriaLabel}
    portalId={portalId}
    containerId={containerId}
  >
    <WhatsThisContent config={config} />
  </BottomSheet>
);

export default WhatsThisBottomSheet;
