import { COUNTRIES } from '@onefootprint/global-constants';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { checkIsPhoneValid, EmailPreview, PhoneForm } from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import { Stack } from '@onefootprint/ui';
import noop from 'lodash/fp/noop';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useIdentify } from '@/src/queries';
import type { HeaderProps } from '@/src/types';

import { useIdentifyMachine } from '../../state';

type StepPhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const StepPhone = ({ children, Header }: StepPhoneProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { phoneNumber, email, sandboxId },
    obConfigAuth,
    config: { isLive },
  } = state.context;
  const { t } = useTranslation('common');
  const mutIdentify = useIdentify({ obConfigAuth, sandboxId });
  const showRequestErrorToast = useRequestErrorToast();

  const options = COUNTRIES;

  const handlePhoneValidation = (phone: string) =>
    checkIsPhoneValid(phone, !isLive);

  const handleChangeEmail = () => {
    send({ type: 'identifyReset' });
  };

  const handleSubmit = (formData: { phoneNumber: string }) => {
    const phoneFromForm = formData.phoneNumber;
    mutIdentify.mutate(
      { identifier: { phoneNumber: phoneFromForm } },
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
              user: res.user,
              phoneNumber: phoneFromForm,
              successfulIdentifier: { phoneNumber: phoneFromForm },
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
          isLoading={mutIdentify.isLoading}
          onSubmit={mutIdentify.isLoading ? noop : handleSubmit}
          options={options}
          validator={handlePhoneValidation}
          texts={{
            cta: t('continue'),
            phoneInvalid: t('phone-step.form.input-invalid'),
            phoneLabel: t('phone-number'),
            phoneRequired: t('phone-step.form.input-required'),
          }}
        />
      </Stack>
      {children}
    </>
  );
};

export default StepPhone;
