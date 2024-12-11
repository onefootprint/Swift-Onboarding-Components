import type { UserAmlFormData } from '../../../user-aml-form/user-aml-form.types';

export type VerificationChecksFormData = {
  runKyc: boolean;
  isNeuroEnabled: boolean;
  isSentilinkEnabled: boolean;
} & UserAmlFormData;
