import type { TenantBillingProfile } from '@onefootprint/types/src/api/get-tenants';
import { TENANT_BILLING_PROFILE_PRODUCTS } from '@onefootprint/types/src/api/get-tenants';

const ifChanged = <T>(a: T, b: T) => {
  // Treat empty string as explicit null in order to clear the value on the backend
  const nullableA = a === '' ? null : a;
  return nullableA !== b ? nullableA : undefined;
};

export type BillingProfileFormData = TenantBillingProfile;

export const convertFormData = (
  bp: TenantBillingProfile | undefined,
  formData: BillingProfileFormData,
): TenantBillingProfile =>
  Object.fromEntries(
    TENANT_BILLING_PROFILE_PRODUCTS.map(k => {
      const value = ifChanged(formData?.[k], bp?.[k]);
      return [k, value];
    }),
  );
