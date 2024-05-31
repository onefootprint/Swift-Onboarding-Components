import { useRequestErrorToast } from '@onefootprint/hooks';
import { IcoCheck24, IcoCloseSmall24 } from '@onefootprint/icons';
import type { TenantDetail } from '@onefootprint/types';
import type { TenantVendorControl } from '@onefootprint/types/src/api/get-tenants';
import { Checkbox, Stack, TextInput } from '@onefootprint/ui';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { EncryptedCell, Field, Fieldset } from 'src/components';
import type { FieldsetProps } from 'src/components/fieldset/fieldset';

import useUpdateTenant from '../../hooks/use-update-tenant';
import type { TenantVendorControlFormData } from './convert-form-data';
import { convertFormData } from './convert-form-data';

type BillingProfileProps = {
  tenant: TenantDetail;
};

const UPDATE_TVC_FORM_ID = 'update-tvc-form';

const getDefaultValues = (
  tvc?: TenantVendorControl,
): TenantVendorControlFormData => ({
  idologyEnabled: tvc?.idologyEnabled || false,
  experianEnabled: tvc?.experianEnabled || false,
  lexisEnabled: tvc?.lexisEnabled || false,
  experianSubscriberCode: tvc?.experianSubscriberCode || '',
  // Since the middesk API key is encrypted, use encrypted text as a placeholder
  middeskApiKey: tvc?.middeskApiKeyExists ? '••••••••••' : '',
});

const VendorControl = ({ tenant }: BillingProfileProps) => {
  const tvc = tenant.vendorControl;

  const editMethods = useForm<TenantVendorControlFormData>({
    defaultValues: getDefaultValues(tvc),
  });
  const { register, reset, handleSubmit } = editMethods;

  const checkbox = (value: boolean | undefined) =>
    value ? <IcoCheck24 /> : <IcoCloseSmall24 />;
  const FIELDS = [
    {
      title: 'Idology Enabled',
      content: checkbox(tvc?.idologyEnabled),
      editModeContent: <Checkbox {...register(`idologyEnabled`, {})} />,
    },
    {
      title: 'Experian Enabled',
      content: checkbox(tvc?.experianEnabled),
      editModeContent: <Checkbox {...register(`experianEnabled`, {})} />,
    },
    {
      title: 'Lexis Enabled',
      content: checkbox(tvc?.lexisEnabled),
      editModeContent: <Checkbox {...register(`lexisEnabled`, {})} />,
    },
    {
      title: 'Experian Subscriber Code',
      content: tvc?.experianSubscriberCode || '-',
      editModeContent: (
        <TextInput
          placeholder="1234567"
          {...register('experianSubscriberCode')}
        />
      ),
    },
    {
      title: 'Middesk API key',
      content: tvc?.middeskApiKeyExists ? <EncryptedCell /> : '-',
      editModeContent: (
        <TextInput placeholder="key" {...register('middeskApiKey')} />
      ),
    },
  ];

  const [isEditing, setIsEditing] = useState(false);
  const updateTenantMutation = useUpdateTenant(tenant.id);
  const showErrorToast = useRequestErrorToast();

  const handleFormSubmit = (formData: TenantVendorControlFormData) => {
    const tvcRequestData = convertFormData(tvc, formData);
    if (Object.values(tvcRequestData).every(v => v === undefined)) {
      setIsEditing(false);
      reset();
      return;
    }
    updateTenantMutation.mutate(
      {
        vendorControl: tvcRequestData,
      },
      {
        onSuccess: newTenant => {
          setIsEditing(false);
          reset(getDefaultValues(newTenant.vendorControl));
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
    form: isEditing ? UPDATE_TVC_FORM_ID : undefined,
    disabled: updateTenantMutation.isLoading,
  };

  return (
    <FormProvider {...editMethods}>
      <form id={UPDATE_TVC_FORM_ID} onSubmit={handleSubmit(handleFormSubmit)}>
        <Fieldset title="Options" cta={headerCta}>
          <Stack direction="column" gap={5}>
            {FIELDS.map(f => (
              <Field label={f.title} key={f.title}>
                {!isEditing || !f.editModeContent
                  ? f.content
                  : f.editModeContent}
              </Field>
            ))}
          </Stack>
        </Fieldset>
      </form>
    </FormProvider>
  );
};

export default VendorControl;
