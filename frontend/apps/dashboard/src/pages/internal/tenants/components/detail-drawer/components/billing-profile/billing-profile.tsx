import { useRequestErrorToast } from '@onefootprint/hooks';
import type { TenantDetail } from '@onefootprint/types';
import type {
  TenantBillingProfile,
  TenantBillingProfileProduct,
} from '@onefootprint/types/src/api/get-tenants';
import { Stack, TextInput } from '@onefootprint/ui';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Field, Fieldset } from 'src/components';
import type { FieldsetProps } from 'src/components/fieldset/fieldset';

import useUpdateTenant from '../../hooks/use-update-tenant';
import type { BillingProfileFormData } from './convert-form-data';
import { convertFormData } from './convert-form-data';

type BillingProfileProps = {
  tenant: TenantDetail;
};

type BillingProfileField = {
  title: string;
  field: TenantBillingProfileProduct;
};

const UPDATE_BP_FORM_ID = 'update-bp-form';

const KYC: BillingProfileField[] = [
  {
    title: 'KYC',
    field: 'kyc',
  },
  {
    title: 'One-click KYC',
    field: 'oneClickKyc',
  },
  {
    title: 'KYC Waterfall (second vendor)',
    field: 'kycWaterfallSecondVendor',
  },
  {
    title: 'KYC Waterfall (third vendor)',
    field: 'kycWaterfallThirdVendor',
  },
];

const OTHER_VERIFICATIONS: BillingProfileField[] = [
  {
    title: 'ID documents',
    field: 'idDocs',
  },
  {
    title: 'KYB',
    field: 'kyb',
  },
  {
    title: 'CURP verification',
    field: 'curpVerification',
  },
];

const VAULTING: BillingProfileField[] = [
  {
    title: 'Monthly PII',
    field: 'pii',
  },
  {
    title: 'Hot vaults',
    field: 'hotVaults',
  },
  {
    title: 'Hot proxy vaults',
    field: 'hotProxyVaults',
  },
  {
    title: 'Monthly vaults with PCI',
    field: 'vaultsWithPci',
  },
  {
    title: 'Monthly vaults with Non-PCI',
    field: 'vaultsWithNonPci',
  },
];

const WATCHLIST: BillingProfileField[] = [
  {
    title: 'Monthly Watchlist',
    field: 'watchlist',
  },
  {
    title: 'Adverse media (per user)',
    field: 'adverseMediaPerUser',
  },
  {
    title: 'Continuous monitoring (per year)',
    field: 'continuousMonitoringPerYear',
  },
];

const OTHER: BillingProfileField[] = [
  {
    title: 'Monthly minimum on identity products',
    field: 'monthlyMinimum',
  },
  {
    title: 'Monthly platform fee',
    field: 'monthlyPlatformFee',
  },
];

const SECTIONS = [
  {
    title: 'KYC',
    fields: KYC,
  },
  {
    title: 'Other verifications',
    fields: OTHER_VERIFICATIONS,
  },
  {
    title: 'Vaulting',
    fields: VAULTING,
  },
  {
    title: 'Watchlist monitoring',
    fields: WATCHLIST,
  },
  {
    title: 'Other',
    fields: OTHER,
  },
];

const getDefaultValues = (bp?: TenantBillingProfile): BillingProfileFormData =>
  bp || ({} as BillingProfileFormData);

const BillingProfile = ({ tenant }: BillingProfileProps) => {
  const bp = tenant.billingProfile;

  const editMethods = useForm<BillingProfileFormData>({
    defaultValues: getDefaultValues(bp),
  });
  const { register, reset, handleSubmit } = editMethods;

  const [isEditing, setIsEditing] = useState(false);
  const updateTenantMutation = useUpdateTenant(tenant.id);
  const showErrorToast = useRequestErrorToast();

  const handleFormSubmit = (formData: TenantBillingProfile) => {
    const bpRequestData = convertFormData(bp, formData);
    if (Object.values(bpRequestData).every(v => v === undefined)) {
      setIsEditing(false);
      reset();
      return;
    }
    updateTenantMutation.mutate(
      {
        billingProfile: bpRequestData,
      },
      {
        onSuccess: newTenant => {
          setIsEditing(false);
          reset(getDefaultValues(newTenant.billingProfile));
        },
        onError: e => {
          showErrorToast(e);
          setIsEditing(false);
          reset();
        },
      },
    );
  };

  const enableEditMode = () => {
    // For some reason, without this setTimeout, we immediately exit out of edit mode...
    setTimeout(() => setIsEditing(true), 10);
  };

  const headerCta: FieldsetProps['cta'] = {
    label: isEditing ? 'Save' : 'Edit',
    onClick: isEditing ? undefined : enableEditMode,
    type: isEditing ? 'submit' : 'button',
    form: isEditing ? UPDATE_BP_FORM_ID : undefined,
    disabled: updateTenantMutation.isLoading,
  };

  const priceDisplay = (value?: string | null) =>
    value ? `${value} cents` : '-';
  return (
    <FormProvider {...editMethods}>
      <form id={UPDATE_BP_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack direction="column">
          {SECTIONS.map((section, i) => (
            <Fieldset
              title={section.title}
              key={section.title}
              cta={i === 0 ? headerCta : undefined}
            >
              <Stack direction="column" gap={5}>
                {section.fields.map(f => (
                  <Field label={f.title} key={f.title}>
                    {!isEditing && priceDisplay(bp?.[f.field])}
                    {isEditing && (
                      <TextInput placeholder="0" {...register(f.field)} />
                    )}
                  </Field>
                ))}
              </Stack>
            </Fieldset>
          ))}
        </Stack>
      </form>
    </FormProvider>
  );
};

export default BillingProfile;
