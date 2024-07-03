import type { TenantBillingProfile } from '@onefootprint/types/src/api/get-tenants';
import { TenantBillingProfileProduct } from '@onefootprint/types/src/api/get-tenants';

import { ifChanged, strOrNull } from '../../../utils/form-data-utils';

export type BillingProfileFormData = TenantBillingProfile;

export const convertFormData = (
  bp: TenantBillingProfile | undefined,
  formData: BillingProfileFormData,
): TenantBillingProfile =>
  Object.fromEntries(
    Object.values(TenantBillingProfileProduct).map(k => {
      // Serialize the empty string as null
      const value = ifChanged(strOrNull(formData?.[k]), bp?.[k]);
      return [k, value];
    }),
  );
