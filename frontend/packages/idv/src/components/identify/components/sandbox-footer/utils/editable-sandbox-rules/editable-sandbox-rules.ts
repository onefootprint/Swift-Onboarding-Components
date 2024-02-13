import type { IdentifyBootstrapData } from '@onefootprint/types';
import type { StateValue } from 'xstate';

const isEmailStep = (x: StateValue) => x === 'emailIdentification';
const isPhoneStep = (x: StateValue) => x === 'phoneIdentification';
const isSmsStep = (x: StateValue) => x === 'smsChallenge';

const sandboxIdEditRules = (
  step: StateValue,
  bootstrapData: IdentifyBootstrapData,
): boolean =>
  (isEmailStep(step) && !bootstrapData.email && !bootstrapData.phoneNumber) ||
  (isEmailStep(step) && !bootstrapData.email && !!bootstrapData.phoneNumber) ||
  (isPhoneStep(step) && !!bootstrapData.email) ||
  (isSmsStep(step) && !!bootstrapData.email && !!bootstrapData.phoneNumber);

export default sandboxIdEditRules;
