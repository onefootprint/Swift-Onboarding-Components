import type {
  BootstrapIgnoredBusinessDI,
  BusinessDI,
  IdDI,
  ValueTypeForBusinessDI,
  ValueTypeForIdDI,
} from '@onefootprint/types';

import type { CompletePayload } from './utils/state-machine';
import type { IdvMachineArgs } from './utils/state-machine/machine';

export type IdvProps = IdvMachineArgs;
export type IdvCompletePayload = CompletePayload;
export type DIMetadata<T> = { value: T; isBootstrap: boolean };

/** Record of data either bootstrapped into IDV or collected during IDV. */
export type UserData = Partial<{ [K in IdDI]: DIMetadata<ValueTypeForIdDI<K>> }>;
export type BusinessData = Partial<{ [K in BusinessDI]: DIMetadata<ValueTypeForBusinessDI<K>> }>;
export type BootstrapBusinessData = Omit<BusinessData, BootstrapIgnoredBusinessDI>;
