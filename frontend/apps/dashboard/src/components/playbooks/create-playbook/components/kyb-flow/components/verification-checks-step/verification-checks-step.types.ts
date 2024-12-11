import type { UserAmlFormData } from '../../../user-aml-form/user-aml-form.types';

export type VerificationChecksFormData = {
  runKyb: boolean;
  runKyc: boolean;
  kybKind: 'ein' | 'full';
  businessAml: boolean;
} & UserAmlFormData;
