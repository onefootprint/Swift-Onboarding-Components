import type { IdDI, ValueTypeForIdDI } from '@onefootprint/types';

import type { CompletePayload } from './utils/state-machine';
import type { IdvMachineArgs } from './utils/state-machine/machine';

export type IdvProps = IdvMachineArgs;
export type IdvCompletePayload = CompletePayload;

export type UserDatum<T> = {
  value: T;
  isBootstrap: boolean;
};

/**
 * Record of data either bootstrapped into IDV or collected during IDV.
 */
export type UserData = Partial<{
  [K in IdDI]: UserDatum<ValueTypeForIdDI<K>>;
}>;
