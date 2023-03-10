import { CollectedKybDataOption } from '@onefootprint/types';
import { StateValue } from 'xstate';

import {
  hasMissingAttributes,
  isMissingBasicDataAttribute,
  isMissingBeneficialOwnerAttribute,
  isMissingBusinessAddressAttribute,
} from '../../../utils/missing-attributes';

/*
  TODO:
  - consolidate these placeholder types with backend
  - add unit tests for the util
*/

const getCurrentStepFromMissingAttributes = (
  mustCollect: CollectedKybDataOption[],
  state: StateValue,
) => {
  if (!hasMissingAttributes(mustCollect)) {
    return 0;
  }
  let currentStep = 0;
  if (isMissingBasicDataAttribute(mustCollect)) {
    currentStep += 1;
    if (state === 'basicData') {
      return currentStep;
    }
  }
  if (isMissingBusinessAddressAttribute(mustCollect)) {
    currentStep += 1;
    if (state === 'businessAddress') {
      return currentStep;
    }
  }
  if (isMissingBeneficialOwnerAttribute(mustCollect)) {
    currentStep += 1;
    if (state === 'beneficialOwner') {
      return currentStep;
    }
  }
  return currentStep;
};

export default getCurrentStepFromMissingAttributes;
