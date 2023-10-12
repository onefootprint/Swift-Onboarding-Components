import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import { IdDI } from '@onefootprint/types';
import { Box, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import EditableFormButtonContainer from '../../../../../../components/editable-form-button-container';
import HeaderTitle from '../../../../../../components/layout/components/header-title';
import Logger from '../../../../../../utils/logger';
import NavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import useSyncEmail from '../../../../hooks/use-sync-email';

type EmailCollectProps = {
  authToken?: string;
  onComplete: (email: string) => void;
  onCancel?: () => void;
  hideHeader?: boolean;
  ctaLabel?: string;
};

type FormData = {
  email: string;
};

const EmailCollect = ({
  hideHeader,
  authToken,
  onComplete,
  onCancel,
  ctaLabel,
}: EmailCollectProps) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const { t } = useTranslation('pages.email');
  const { mutation, syncEmail } = useSyncEmail();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      email: data[IdDI.email]?.value,
    },
  });

  const onSubmitForm = (formData: FormData) => {
    const { email } = formData;

    syncEmail({
      email,
      authToken,
      speculative: true,
      onSuccess: () => {
        onComplete(email);
      },
      onError: (error: unknown) => {
        console.error(
          'Error while speculatively syncing email on kyc email-collect page',
          getErrorMessage(error),
        );
        Logger.error(
          `Error while speculatively syncing email on kyc email-collect page, ${getErrorMessage(
            error,
          )}`,
          'kyc-email-collect',
        );
      },
    });
  };

  return (
    <>
      {hideHeader ? null : (
        <>
          <NavigationHeader />
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle')}
            sx={{ marginBottom: 7 }}
          />
        </>
      )}
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Box marginBottom={7}>
          <TextInput
            data-private
            type="email"
            hasError={!!errors.email}
            hint={errors.email?.message}
            label={t('email.label')}
            placeholder={t('email.placeholder')}
            defaultValue={getValues('email')}
            {...register('email', {
              required: {
                value: true,
                message: t('email.errors.required'),
              },
            })}
          />
        </Box>
        <EditableFormButtonContainer
          onCancel={onCancel}
          isLoading={mutation.isLoading}
          ctaLabel={ctaLabel}
        />
      </form>
    </>
  );
};

export default EmailCollect;
