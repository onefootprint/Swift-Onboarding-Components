import { getRiskSignal } from '@onefootprint/fixtures/dashboard';
import type { RiskSignal } from '@onefootprint/request-types/dashboard';

export const riskSignal: RiskSignal = getRiskSignal({
  reasonCode: 'email_not_found_on_file',
});
