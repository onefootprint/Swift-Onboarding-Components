import { IdDocImageProcessingError, IdDocImageUploadError } from '@onefootprint/types';

import type { MachineContext } from '../../utils/state-machine';
import { initialContextDL } from '../../utils/state-machine/machine.test.config';

const contextWithErrors: MachineContext = {
  ...initialContextDL,
  errors: [
    { errorType: IdDocImageProcessingError.countryCodeMismatch },
    { errorType: IdDocImageProcessingError.wrongDocumentSide },
    { errorType: IdDocImageUploadError.fileTypeNotAllowed },
  ],
};

export default contextWithErrors;
