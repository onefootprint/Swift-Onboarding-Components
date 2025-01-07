import type {
  BillingMinimum,
  TenantBillingProfile,
  TenantBillingProfilePrices,
} from '@onefootprint/types/src/api/get-tenants';
import { TenantBillingProfileProduct } from '@onefootprint/types/src/api/get-tenants';

import type { UpdateTenantBillingProfile } from '../../../hooks/use-update-tenant';
import { ifChanged, strOrNull } from '../../../utils/form-data-utils';

export type BillingMinimumFormData = Omit<BillingMinimum, 'products'> & {
  products: { label: string; value: TenantBillingProfileProduct }[];
};

export type BillingProfileFormData = {
  prices: TenantBillingProfilePrices;
  billingEmail?: string;
  pricingDoc?: string;
  minimums: BillingMinimumFormData[];
  platformFeeStartsOn?: string;
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
  const formMinimums = formData.minimums.map(m => ({
    ...m,
    products: m.products.map(p => p.value),
    startsOn: strOrNull(m.startsOn),
  }));
  return {
    prices: Object.values(prices).some(v => v !== undefined) ? prices : undefined,
    // Serialize the empty string as null
    billingEmail: ifChanged(strOrNull(formData.billingEmail), bp?.billingEmail),
    pricingDoc: ifChanged(strOrNull(formData.pricingDoc), bp?.pricingDoc),
    platformFeeStartsOn: ifChanged(strOrNull(formData.platformFeeStartsOn), bp?.platformFeeStartsOn),
    omitBilling: ifChanged(formData.omitBilling, bp?.omitBilling),
    sendAutomatically: ifChanged(formData.sendAutomatically, bp?.sendAutomatically),
    minimums: ifChanged(formMinimums, bp?.minimums),
  };
};
