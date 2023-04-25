import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import {
  OnboardingConfig,
  UserData,
  UserDataAttribute,
} from '@onefootprint/types';
import { Box, Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../../components/layout/components/navigation-header';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import useSyncEmail from '../../../../hooks/use-sync-email';

type EmailCollectProps = {
  authToken?: string;
  onComplete: (email: string) => void;
  hideHeader?: boolean;
  config?: OnboardingConfig;
  ctaLabel?: string;
};

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailCollect = ({
  hideHeader,
  authToken,
  onComplete,
  ctaLabel,
}: EmailCollectProps) => {
  const [state] = useCollectKycDataMachine();
  const { data, sandboxSuffix, config } = state.context;
  const { t, allT } = useTranslation('pages.email');
  const showRequestErrorToast = useRequestErrorToast();
  const { mutation, syncEmail } = useSyncEmail();
  const isSandbox = !config?.isLive;
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      [UserDataAttribute.email]: data[UserDataAttribute.email],
    },
  });

  const onSubmitForm = (formData: FormData) => {
    const { email } = formData;
    if (isSandbox && !sandboxSuffix) {
      console.error(
        'Found empty sandbox suffix in collect-kyc-data email-collect form while in sandbox mode.',
      );
    }

    syncEmail({
      email,
      sandboxSuffix,
      authToken,
      speculative: true,
      onSuccess: () => {
        onComplete(email);
      },
      onError: (error: unknown) => {
        showRequestErrorToast(error);
        console.error(error);
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
        <Box sx={{ marginBottom: 7 }}>
          <TextInput
            data-private
            type="email"
            hasError={!!errors.email}
            hint={errors.email?.message}
            label={t('email.label')}
            placeholder={t('email.placeholder')}
            defaultValue={getValues(UserDataAttribute.email)}
            {...register(UserDataAttribute.email, {
              required: {
                value: true,
                message: t('email.errors.required'),
              },
            })}
          />
        </Box>
        <Button type="submit" fullWidth loading={mutation.isLoading}>
          {ctaLabel || allT('pages.cta.continue')}
        </Button>
      </form>
    </>
  );
};

export default EmailCollect;
