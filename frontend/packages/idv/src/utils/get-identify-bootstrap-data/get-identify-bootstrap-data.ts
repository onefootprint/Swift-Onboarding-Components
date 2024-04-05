import type { IdvBootstrapData } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';

export type IdentifyBootstrapData = {
  email?: string;
  phoneNumber?: string;
};

export const getIdentifyBootstrapData = (
  data?: IdvBootstrapData,
): IdentifyBootstrapData => ({
  email: data?.[IdDI.email],
  phoneNumber: data?.[IdDI.phoneNumber],
});
