import { useRequestErrorToast } from '@onefootprint/hooks';
import type { TenantDetail } from '@onefootprint/types';
import type { TenantBillingProfile } from '@onefootprint/types/src/api/get-tenants';
import { TenantBillingProfileProduct } from '@onefootprint/types/src/api/get-tenants';
import { Checkbox, LinkButton, MultiSelect, Stack, Text, TextInput } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';
import { Field, Fieldset } from 'src/components';
import type { FieldsetProps } from 'src/components/fieldset/fieldset';

import { IcoCheck24, IcoCloseSmall24, IcoPlusSmall24 } from '@onefootprint/icons';
import { snakeCase } from 'lodash';
import useUpdateTenant from '../../hooks/use-update-tenant';
import type { BillingProfileFormData } from './convert-form-data';
import { convertFormData } from './convert-form-data';
import type { BillingMinimumFormData } from './convert-form-data/convert-form-data';

type BillingProfileProps = {
  tenant: TenantDetail;
};

const UPDATE_BP_FORM_ID = 'update-bp-form';

const KYC = [
  TenantBillingProfileProduct.kyc,
  TenantBillingProfileProduct.oneClickKyc,
  TenantBillingProfileProduct.kycWaterfallSecondVendor,
  TenantBillingProfileProduct.kycWaterfallThirdVendor,
];

const OTHER_VERIFICATIONS = [
  TenantBillingProfileProduct.idDocs,
  TenantBillingProfileProduct.kyb,
  TenantBillingProfileProduct.kybEinOnly,
  TenantBillingProfileProduct.curpVerification,
  TenantBillingProfileProduct.sambaActivityHistory,
  TenantBillingProfileProduct.sentilinkScore,
  TenantBillingProfileProduct.neuroIdBehavioral,
];

const VAULTING = [
  TenantBillingProfileProduct.pii,
  TenantBillingProfileProduct.hotVaults,
  TenantBillingProfileProduct.hotProxyVaults,
  TenantBillingProfileProduct.vaultsWithPci,
  TenantBillingProfileProduct.vaultsWithNonPci,
];

const WATCHLIST = [
  TenantBillingProfileProduct.continuousMonitoringPerYear,
  TenantBillingProfileProduct.adverseMediaPerYear,
  TenantBillingProfileProduct.adverseMediaPerOnboarding,
  TenantBillingProfileProduct.watchlistChecks,
];

const ProductToTitle: Record<TenantBillingProfileProduct, string> = {
  [TenantBillingProfileProduct.kyc]: 'KYC',
  [TenantBillingProfileProduct.oneClickKyc]: 'One-click KYC',
  [TenantBillingProfileProduct.kycWaterfallSecondVendor]: 'KYC waterfall (second vendor)',
  [TenantBillingProfileProduct.kycWaterfallThirdVendor]: 'KYC waterfall (third vendor)',
  [TenantBillingProfileProduct.idDocs]: 'ID documents',
  [TenantBillingProfileProduct.kyb]: 'KYB',
  [TenantBillingProfileProduct.kybEinOnly]: 'KYB (EIN-only)',
  [TenantBillingProfileProduct.curpVerification]: 'CURP verification',
  [TenantBillingProfileProduct.pii]: 'Per vault (monthly)',
  [TenantBillingProfileProduct.hotVaults]: 'Hot vaults',
  [TenantBillingProfileProduct.hotProxyVaults]: 'Hot proxy vaults',
  [TenantBillingProfileProduct.vaultsWithPci]: 'Per vault with card/custom data (monthly)',
  [TenantBillingProfileProduct.vaultsWithNonPci]: 'Per vault with id data (monthly) ',
  [TenantBillingProfileProduct.watchlistChecks]: 'Monthly watchlist (legacy)',
  [TenantBillingProfileProduct.continuousMonitoringPerYear]: 'Continuous monitoring (per year)',
  [TenantBillingProfileProduct.adverseMediaPerYear]: 'Adverse media (per year)',
  [TenantBillingProfileProduct.adverseMediaPerOnboarding]: 'Adverse media (per user, legacy)',
  [TenantBillingProfileProduct.monthlyPlatformFee]: 'Monthly platform fee',
  [TenantBillingProfileProduct.sambaActivityHistory]: 'Samba Safety Activity History',
  [TenantBillingProfileProduct.neuroIdBehavioral]: 'Neuro ID',
  [TenantBillingProfileProduct.sentilinkScore]: 'Sentilink Synthetic and ID Theft',
};

const PRICE_SECTIONS = [
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
];

const getDefaultValues = (bp?: TenantBillingProfile): BillingProfileFormData => {
  const { minimums, ...rest } = bp || {};
  const minimumsFormData: BillingMinimumFormData[] = (minimums ?? []).map(m => ({
    ...m,
    products: m.products.map(p => ({ label: ProductToTitle[p], value: p })),
  }));
  return {
    ...rest,
    minimums: minimumsFormData,
  } as BillingProfileFormData;
};
const priceDisplay = (value?: string | null) => (value ? `${value} cents` : '-');

type TenantField = {
  title: string;
  content: React.ReactNode;
  editModeContent?: React.ReactNode;
};

const BillingProfile = ({ tenant }: BillingProfileProps) => {
  const bp = tenant.billingProfile;

  const editMethods = useForm<BillingProfileFormData>({
    defaultValues: getDefaultValues(bp),
  });
  const { register, reset, handleSubmit } = editMethods;

  const [isEditing, setIsEditing] = useState(false);
  const updateTenantMutation = useUpdateTenant(tenant.id);
  const showErrorToast = useRequestErrorToast();

  const checkbox = (value: boolean) => (value ? <IcoCheck24 /> : <IcoCloseSmall24 />);

  const settings: TenantField[] = [
    {
      title: 'Billing email',
      content: bp?.billingEmail || '-',
      editModeContent: <TextInput placeholder="jane@acmebank.org" {...register('billingEmail')} />,
    },
    {
      title: 'Pricing document',
      content: bp?.pricingDoc || '-',
      editModeContent: <TextInput placeholder="https://notion.so/..." {...register('pricingDoc')} />,
    },
    {
      title: 'Send invoice automatically',
      content: checkbox(bp?.sendAutomatically || false),
      editModeContent: <Checkbox {...register('sendAutomatically', {})} />,
    },
    {
      title: 'Omit generating invoices',
      content: checkbox(bp?.omitBilling || false),
      editModeContent: <Checkbox {...register('omitBilling', {})} />,
    },
  ];

  const platformFee: TenantField[] = [
    {
      title: 'Amount',
      content: priceDisplay(bp?.prices[TenantBillingProfileProduct.monthlyPlatformFee]),
      editModeContent: (
        <TextInput placeholder="0" {...register(`prices.${TenantBillingProfileProduct.monthlyPlatformFee}`)} />
      ),
    },
    {
      title: 'Starts on',
      content: bp?.platformFeeStartsOn || '-',
      editModeContent: <TextInput placeholder="2025-01-01" {...register('platformFeeStartsOn')} />,
    },
  ];

  const handleFormSubmit = (formData: BillingProfileFormData) => {
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
    disabled: updateTenantMutation.isPending,
  };

  if (tenant.superTenantId) {
    return (
      <Text variant="body-3" color="tertiary">
        Billing profile is inherited from parent tenant. Only one invoice is generated for the parent tenant and its
        children.
      </Text>
    );
  }

  return (
    <FormProvider {...editMethods}>
      <form id={UPDATE_BP_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack direction="column">
          <Fieldset title={'Settings'} cta={headerCta}>
            <Stack direction="column" gap={5}>
              {settings.map(f => (
                <Field label={f.title} key={f.title}>
                  {!isEditing || !f.editModeContent ? f.content : f.editModeContent}
                </Field>
              ))}
            </Stack>
          </Fieldset>
          {PRICE_SECTIONS.map(section => (
            <Fieldset title={section.title} key={section.title}>
              <Stack direction="column" gap={5}>
                {section.fields.map(p => (
                  <Field label={ProductToTitle[p]} key={p}>
                    {!isEditing && priceDisplay(bp?.prices[p])}
                    {isEditing && <TextInput placeholder="0" {...register(`prices.${p}`)} />}
                  </Field>
                ))}
              </Stack>
            </Fieldset>
          ))}
          <Fieldset title="Monthly platform fee">
            <Stack direction="column" gap={5}>
              {platformFee.map(f => (
                <Field label={f.title} key={f.title}>
                  {!isEditing || !f.editModeContent ? f.content : f.editModeContent}
                </Field>
              ))}
            </Stack>
          </Fieldset>
          <Minimums isEditing={isEditing} />
        </Stack>
      </form>
    </FormProvider>
  );
};

const Minimums = ({ isEditing }: { isEditing: boolean }) => {
  const { control, register } = useFormContext<BillingProfileFormData>();
  const { append, fields, remove } = useFieldArray({ name: 'minimums', control });
  const emptyMinimum: BillingMinimumFormData = {
    products: [],
    amountCents: '0',
    name: '',
  };
  const handleAdd = () => append(emptyMinimum);
  const handleRemove = (index: number) => remove(index);

  const productOptions = Object.values(TenantBillingProfileProduct).map(p => ({
    label: ProductToTitle[p],
    // Since the products are also used as a key in the response, they are stored as camelCase... But the
    // real values from the backend are snake_case.
    value: snakeCase(p) as TenantBillingProfileProduct,
  }));

  return (
    <>
      {fields.map((minimum, index) => (
        <Fieldset
          title={`Monthly minimum ${minimum.name ? `(${minimum.name})` : ''}`}
          cta={isEditing ? { label: 'Remove', onClick: () => handleRemove(index) } : undefined}
          key={`minimum-${minimum.name}`}
        >
          <div className="flex flex-col gap-5">
            <Field label="Name (appears on invoice)">
              {!isEditing && minimum.name}
              {isEditing && <TextInput placeholder="Name" {...register(`minimums.${index}.name`)} />}
            </Field>
            <Field label="Amount">
              {!isEditing && priceDisplay(minimum.amountCents)}
              {isEditing && <TextInput placeholder="0" {...register(`minimums.${index}.amountCents`)} />}
            </Field>
            <Field label="Products that count towards this minimum">
              {!isEditing && minimum.products.map(p => p.label).join(', ')}
              {isEditing && (
                <Controller
                  control={control}
                  name={`minimums.${index}.products`}
                  rules={{
                    required: {
                      value: true,
                      message: 'Products required',
                    },
                  }}
                  render={({ field }) => (
                    <MultiSelect
                      options={productOptions}
                      size="compact"
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  )}
                />
              )}
            </Field>
            <Field label="Starts on">
              {!isEditing && (minimum.startsOn || '-')}
              {isEditing && (
                <TextInput type="date" placeholder="2025-01-01" {...register(`minimums.${index}.startsOn`)} />
              )}
            </Field>
          </div>
        </Fieldset>
      ))}
      {isEditing && (
        <div className="flex mb-7">
          <LinkButton
            data-dd-action-name="add-beneficial-owner"
            iconComponent={IcoPlusSmall24}
            iconPosition="left"
            variant="label-2"
            onClick={handleAdd}
          >
            Add a monthly minimum
          </LinkButton>
        </div>
      )}
    </>
  );
};

export default BillingProfile;
