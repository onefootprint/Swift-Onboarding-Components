import type { TenantBillingProfile, TenantBillingProfilePrices } from '@onefootprint/types/src/api/get-tenants';
import { TenantBillingProfileProduct } from '@onefootprint/types/src/api/get-tenants';

import { UpdateTenantBillingProfile } from '../../../hooks/use-update-tenant';
import { ifChanged, strOrNull } from '../../../utils/form-data-utils';

export type BillingProfileFormData = {
  prices: TenantBillingProfilePrices;
  billingEmail?: string;
  omitBilling: boolean;
  sendAutomatically: boolean;
};

export const convertFormData = (
  bp: TenantBillingProfile | undefined,
  formData: BillingProfileFormData,
): UpdateTenantBillingProfile => {
  const prices = Object.fromEntries(
    Object.values(TenantBillingProfileProduct).map(k => {
      // Serialize the empty string as null
      const value = ifChanged(strOrNull(formData.prices[k]), bp?.prices[k]);
      return [k, value];
    }),
  );
  return {
    prices: Object.values(prices).some(v => v !== undefined) ? prices : undefined,
    // Serialize the empty string as null
    billingEmail: ifChanged(strOrNull(formData.billingEmail), bp?.billingEmail),
    omitBilling: ifChanged(formData.omitBilling, bp?.omitBilling),
    sendAutomatically: ifChanged(formData.sendAutomatically, bp?.sendAutomatically),
  };
};
