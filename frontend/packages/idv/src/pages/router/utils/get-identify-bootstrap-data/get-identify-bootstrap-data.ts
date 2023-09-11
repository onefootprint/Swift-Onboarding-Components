import type {
  IdentifyBootstrapData,
  IdvBootstrapData,
} from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';

const getIdentifyBootstrapData = (
  data?: IdvBootstrapData,
): IdentifyBootstrapData => ({
  email: data?.[IdDI.email],
  phoneNumber: data?.[IdDI.phoneNumber],
});

export default getIdentifyBootstrapData;
