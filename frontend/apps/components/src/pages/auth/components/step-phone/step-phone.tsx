import { COUNTRIES } from '@onefootprint/global-constants';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import {
  checkIsPhoneValid,
  EmailPreview,
  PhoneForm,
} from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import { useIdentify } from '../../hooks';
import { useAuthMachine } from '../../state';
import type { HeaderProps } from '../../types';

type StepPhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const noop = () => undefined;

const StepPhone = ({ children, Header }: StepPhoneProps) => {
  const [state, send] = useAuthMachine();
  const {
    identify: { phoneNumber, email, sandboxId },
    obConfigAuth,
    config: { isLive },
  } = state.context;
  const { t } = useTranslation('pages.auth');
  const identifyMutation = useIdentify();
  const showRequestErrorToast = useRequestErrorToast();

  const options = COUNTRIES;

  const handlePhoneValidation = (phone: string) =>
    checkIsPhoneValid(phone, !isLive);

  const handleChangeEmail = () => {
    send({ type: 'identifyReset' });
  };

  const handleSubmit = (formData: { phoneNumber: string }) => {
    const phoneFromForm = formData.phoneNumber;
    identifyMutation.mutate(
      {
        identifier: { phoneNumber: phoneFromForm },
        obConfigAuth,
        sandboxId,
      },
      {
        onError: error => {
          console.error(
            `Error while identify user on phone-identification page: ${getErrorMessage(
              error,
            )}`,
            'auth-phone-identification',
          );
          showRequestErrorToast(error);
        },
        onSuccess: res => {
          send({
            type: 'identified',
            payload: {
              availableChallengeKinds: res.availableChallengeKinds,
              hasSyncablePassKey: res.hasSyncablePassKey,
              isUnverified: res.isUnverified,
              phoneNumber: phoneFromForm,
              successfulIdentifier: { phoneNumber: phoneFromForm },
              userFound: res.userFound,
            },
          });
        },
      },
    );
  };

  return (
    <>
      <Stack direction="column" gap={8}>
        <Header
          subtitle={t('phone-step.subtitle')}
          title={t('phone-step.title')}
        />
        <EmailPreview
          email={email}
          onChange={handleChangeEmail}
          textCta={t('change')}
        />
        <PhoneForm
          defaultPhone={phoneNumber}
          isLoading={identifyMutation.isLoading}
          onSubmit={identifyMutation.isLoading ? noop : handleSubmit}
          options={options}
          validator={handlePhoneValidation}
          texts={{
            cta: t('continue'),
            phoneInvalid: t('phone-step.form.input-invalid'),
            phoneLabel: t('phone-step.form.input-label'),
            phoneRequired: t('phone-step.form.input-required'),
          }}
        />
      </Stack>
      {children}
    </>
  );
};

export default StepPhone;
