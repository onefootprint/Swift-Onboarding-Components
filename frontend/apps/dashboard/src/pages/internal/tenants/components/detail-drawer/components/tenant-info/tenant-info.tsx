import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import { TenantPreviewApi, TenantSupportedAuthMethod } from '@onefootprint/types/src/api/get-tenants';
import type { TenantDetail } from '@onefootprint/types/src/api/get-tenants';
import type { SelectOption } from '@onefootprint/ui';
import { Checkbox, CodeInline, MultiSelect, Stack, TextInput } from '@onefootprint/ui';
import type React from 'react';
import { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { Field, Fieldset } from 'src/components';
import type { FieldsetProps } from 'src/components/fieldset/fieldset';
import useUpdateTenant from 'src/pages/internal/tenants/components/detail-drawer/hooks/use-update-tenant';

import type { UpdateTenantFormData } from './convert-form-data';
import { convertFormData } from './convert-form-data';

type TenantInfoProps = {
  tenant: TenantDetail;
};

type TenantField = {
  title: string;
  content: React.ReactNode;
  editModeContent?: React.ReactNode;
};

const UPDATE_TENANT_FORM_ID = 'update-tenant-form';

const PREVIEW_API_OPTIONS: SelectOption<TenantPreviewApi>[] = Object.values(TenantPreviewApi).map(value => ({
  label: value,
  value,
}));

const AUTH_METHOD_OPTIONS: SelectOption<TenantSupportedAuthMethod>[] = Object.values(TenantSupportedAuthMethod).map(
  value => ({
    label: value,
    value,
  }),
);

const getDefaultValues = (tenant: TenantDetail): UpdateTenantFormData => ({
  name: tenant.name,
  superTenantId: tenant.superTenantId,
  isDemoTenant: tenant.isDemoTenant,
  domains: tenant.domains.join(','),
  allowDomainAccess: tenant.allowDomainAccess,
  notSandboxRestricted: !tenant.sandboxRestricted,
  notIsProdKycPlaybookRestricted: !tenant.isProdKycPlaybookRestricted,
  notIsProdKybPlaybookRestricted: !tenant.isProdKybPlaybookRestricted,
  notIsProdAuthPlaybookRestricted: !tenant.isProdAuthPlaybookRestricted,
  supportedAuthMethods: AUTH_METHOD_OPTIONS.filter(o => tenant.supportedAuthMethods?.includes(o.value)),
  allowedPreviewApis: PREVIEW_API_OPTIONS.filter(o => tenant.allowedPreviewApis.includes(o.value)),
  companyName: tenant.businessInfo?.companyName || '',
  phone: tenant.businessInfo?.phone || '',
  addressLine1: tenant.businessInfo?.addressLine1 || '',
  city: tenant.businessInfo?.city || '',
  state: tenant.businessInfo?.state || '',
  zip: tenant.businessInfo?.zip || '',
});

const TenantInfo = ({ tenant }: TenantInfoProps) => {
  const editMethods = useForm<UpdateTenantFormData>({
    defaultValues: getDefaultValues(tenant),
  });

  const { control, register, reset, handleSubmit } = editMethods;

  const checkbox = (value: boolean) => (value ? <IcoCheck24 /> : <IcoCloseSmall24 />);

  const basic: TenantField[] = [
    {
      title: 'ID',
      content: <CodeInline>{tenant.id}</CodeInline>,
    },
    {
      title: 'Parent ID',
      content: tenant.superTenantId ? <CodeInline>{tenant.superTenantId}</CodeInline> : '-',
      editModeContent: <TextInput placeholder="org_xxx" {...register('superTenantId')} />,
    },
    {
      title: 'Is demo tenant',
      content: checkbox(tenant.isDemoTenant),
      editModeContent: <Checkbox {...register('isDemoTenant', {})} />,
    },
    {
      title: 'Domains',
      content: tenant.domains.length ? tenant.domains.join(', ') : 'No domains',
      editModeContent: <TextInput placeholder="acme.ai,acme.io" {...register('domains')} />,
    },
    {
      title: 'Domain access enabled',
      content: checkbox(tenant.allowDomainAccess),
      editModeContent: <Checkbox {...register('allowDomainAccess', {})} />,
    },
  ];

  const businessInfo: TenantField[] = [
    {
      title: 'Company name',
      content: tenant.businessInfo?.companyName || '-',
      editModeContent: <TextInput placeholder="Acme Inc" {...register('companyName')} />,
    },
    {
      title: 'Phone',
      content: tenant.businessInfo?.phone || '-',
      editModeContent: <TextInput placeholder="+1 (555) 555-5555" {...register('phone')} />,
    },
    {
      title: 'Address',
      content: tenant.businessInfo?.addressLine1 || '-',
      editModeContent: <TextInput placeholder="123 Main St" {...register('addressLine1')} />,
    },
    {
      title: 'City',
      content: tenant.businessInfo?.city || '-',
      editModeContent: <TextInput placeholder="San Francisco" {...register('city')} />,
    },
    {
      title: 'State',
      content: tenant.businessInfo?.state || '-',
      editModeContent: <TextInput placeholder="CA" {...register('state')} />,
    },
    {
      title: 'ZIP',
      content: tenant.businessInfo?.zip || '-',
      editModeContent: <TextInput placeholder="94105" {...register('zip')} />,
    },
  ];

  const restrictions: TenantField[] = [
    {
      title: 'General access',
      content: checkbox(!tenant.sandboxRestricted),
      editModeContent: <Checkbox {...register('notSandboxRestricted', {})} />,
    },
    {
      title: 'KYC playbooks',
      content: checkbox(!tenant.isProdKycPlaybookRestricted),
      editModeContent: <Checkbox {...register('notIsProdKycPlaybookRestricted', {})} />,
    },
    {
      title: 'KYB playbooks',
      content: checkbox(!tenant.isProdKybPlaybookRestricted),
      editModeContent: <Checkbox {...register('notIsProdKybPlaybookRestricted', {})} />,
    },
    {
      title: 'Auth playbooks',
      content: checkbox(!tenant.isProdAuthPlaybookRestricted),
      editModeContent: <Checkbox {...register('notIsProdAuthPlaybookRestricted', {})} />,
    },
  ];

  const settings: TenantField[] = [
    {
      title: 'Allowed preview APIs',
      content: tenant.allowedPreviewApis.length ? tenant.allowedPreviewApis.join(', ') : '-',
      editModeContent: (
        <Controller
          control={control}
          name="allowedPreviewApis"
          render={({ field, fieldState: { error } }) => (
            <MultiSelect
              onBlur={field.onBlur}
              options={PREVIEW_API_OPTIONS}
              onChange={field.onChange}
              hasError={!!error}
              value={field.value}
            />
          )}
        />
      ),
    },
    {
      title: 'Required login methods',
      content: tenant.supportedAuthMethods?.length ? tenant.supportedAuthMethods.join(', ') : '-',
      editModeContent: (
        <Controller
          control={control}
          name="supportedAuthMethods"
          render={({ field, fieldState: { error } }) => (
            <MultiSelect
              onBlur={field.onBlur}
              options={AUTH_METHOD_OPTIONS}
              onChange={field.onChange}
              hasError={!!error}
              value={field.value}
            />
          )}
        />
      ),
    },
    {
      title: 'Pinned API version',
      content: tenant.pinnedApiVersion || '-',
    },
  ];

  const fieldsets = [
    {
      title: 'Basic info',
      fields: basic,
    },
    {
      title: 'Business info',
      fields: businessInfo,
    },
    {
      title: 'Production access',
      fields: restrictions,
    },
    {
      title: 'Settings',
      fields: settings,
    },
  ];

  const [isEditing, setIsEditing] = useState(false);
  const updateTenantMutation = useUpdateTenant(tenant.id);
  const showErrorToast = useRequestErrorToast();

  const handleFormSubmit = (formData: UpdateTenantFormData) => {
    const requestData = convertFormData(tenant, formData);
    if (Object.values(requestData).every(v => v === undefined)) {
      setIsEditing(false);
      reset();
      return;
    }
    updateTenantMutation.mutate(requestData, {
      onSuccess: updatedTenant => {
        setIsEditing(false);
        reset(getDefaultValues(updatedTenant));
      },
      onError: e => {
        showErrorToast(e);
        setIsEditing(false);
        reset();
      },
    });
  };

  const enableEditMode = () => {
    // For some reason, without this setTimeout, we immediately exit out of edit mode...
    setTimeout(() => setIsEditing(true), 10);
  };

  const headerCta: FieldsetProps['cta'] = {
    label: isEditing ? 'Save' : 'Edit',
    onClick: isEditing ? undefined : enableEditMode,
    type: isEditing ? 'submit' : 'button',
    form: isEditing ? UPDATE_TENANT_FORM_ID : undefined,
    disabled: updateTenantMutation.isPending,
  };

  return (
    <FormProvider {...editMethods}>
      <form id={UPDATE_TENANT_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack direction="column">
          {fieldsets.map((fieldset, i) => (
            <Fieldset title={fieldset.title} key={fieldset.title} cta={i === 0 ? headerCta : undefined}>
              <Stack direction="column" gap={5}>
                {fieldset.fields.map(f => (
                  <Field label={f.title} key={f.title}>
                    {!isEditing || !f.editModeContent ? f.content : f.editModeContent}
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

export default TenantInfo;
