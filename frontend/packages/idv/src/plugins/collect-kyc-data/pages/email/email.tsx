import { IdDI } from '@onefootprint/types';
import { Grid, Stack, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import EditableFormButtonContainer from '../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../components/navigation-header';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import type { SyncDataFieldErrors } from '../../hooks/use-sync-data';
import useSyncData from '../../hooks/use-sync-data';
import type { KycData } from '../../utils/data-types';
import useConvertFormData from './hooks/use-convert-form-data';
import type { FormData } from './types';

type EmailProps = {
  onComplete?: (data: KycData) => void;
  onCancel?: () => void;
  ctaLabel?: string;
  hideHeader?: boolean;
};

const fieldByDi: Partial<Record<IdDI, keyof FormData>> = {
  [IdDI.email]: 'email',
};

const Email = ({ onComplete, onCancel, ctaLabel, hideHeader }: EmailProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { data } = state.context;
  const convertFormData = useConvertFormData();
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.email' });
  const { mutation, syncData } = useSyncData();
  const {
    register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: data[IdDI.email]?.value,
    },
  });

  const handleSyncDataError = (error: SyncDataFieldErrors) => {
    Object.entries(error).forEach(([k, message]) => {
      const di = k as IdDI;
      const field = fieldByDi[di];
      if (field) {
        setError(
          field,
          { message },
          {
            shouldFocus: true,
          },
        );
      }
    });
  };

  const onSubmitForm = (formData: FormData) => {
    syncData({
      data: convertFormData(formData),
      onSuccess: cleanData => {
        send({
          type: 'dataSubmitted',
          payload: cleanData,
        });
        onComplete?.(cleanData);
      },
      onError: handleSyncDataError,
    });
  };

  return (
    <Stack direction="column" gap={7} width="100%">
      {hideHeader ? null : (
        <>
          <NavigationHeader />
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle')}
            marginBottom={7}
          />
        </>
      )}
      <Grid.Container gap={7} as="form" onSubmit={handleSubmit(onSubmitForm)}>
        <Stack direction="column" gap={5}>
          <TextInput
            data-nid-target="email"
            data-private
            data-dd-privacy="mask"
            defaultValue={getValues('email')}
            hasError={!!errors.email}
            hint={errors.email?.message}
            label={t('email.label')}
            placeholder={t('email.placeholder')}
            type="email"
            {...register('email', {
              required: {
                value: true,
                message: t('email.errors.required'),
              },
            })}
          />
        </Stack>
        <EditableFormButtonContainer
          onCancel={onCancel}
          isLoading={mutation.isLoading}
          ctaLabel={ctaLabel}
        />
      </Grid.Container>
    </Stack>
  );
};

export default Email;
