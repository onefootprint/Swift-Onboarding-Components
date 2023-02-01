import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import {
  OnboardingConfig,
  UserData,
  UserDataAttribute,
} from '@onefootprint/types';
import { Box, Button, TextInput } from '@onefootprint/ui';
import React from 'react';
import { useForm } from 'react-hook-form';

import HeaderTitle from '../../../../../../components/header-title';
import NavigationHeader from '../../../../components/navigation-header';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import useSyncEmail from '../../../../hooks/use-sync-email';
import EMAIL_SANDBOX_REGEX from './email-collect.constants';

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
  config,
  ctaLabel,
}: EmailCollectProps) => {
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
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

  const getHint = () => {
    if (errors.email) {
      return errors.email.message;
    }
    return isSandbox ? t('email.hint') : undefined;
  };

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
        showRequestErrorToast(error);
        console.error(error);
      },
    });
  };

  return (
    <>
      {hideHeader ? null : (
        <>
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle')}
            sx={{ marginBottom: 7 }}
          />
          <NavigationHeader />
        </>
      )}
      <form onSubmit={handleSubmit(onSubmitForm)}>
        <Box sx={{ marginBottom: 7 }}>
          <TextInput
            data-private
            hasError={!!errors.email}
            hint={getHint()}
            label={t('email.label')}
            placeholder={t('email.placeholder')}
            defaultValue={getValues(UserDataAttribute.email)}
            {...register(UserDataAttribute.email, {
              required: {
                value: true,
                message: t('email.errors.required'),
              },
              pattern: isSandbox
                ? {
                    value: EMAIL_SANDBOX_REGEX,
                    message: t('email.errors.pattern'),
                  }
                : undefined,
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
