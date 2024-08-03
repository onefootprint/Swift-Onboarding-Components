import { IdDocImageProcessingError } from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';
import { initialContextDL } from '../../utils/state-machine/machine.test.config';

const contextWithSelfieErrors: MachineContext = {
  ...initialContextDL,
  errors: [{ errorType: IdDocImageProcessingError.selfieGlare }],
};

export default contextWithSelfieErrors;
