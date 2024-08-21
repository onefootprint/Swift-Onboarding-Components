import type { UIState } from '@onefootprint/design-tokens';
import { FilingStatus } from '@onefootprint/types';

const statusVariant: Record<FilingStatus, UIState> = {
  [FilingStatus.unknown]: 'neutral',
  [FilingStatus.active]: 'success',
  [FilingStatus.inactive]: 'error',
};

export default statusVariant;
