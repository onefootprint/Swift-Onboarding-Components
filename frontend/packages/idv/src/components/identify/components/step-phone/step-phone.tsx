import { COUNTRIES } from '@onefootprint/global-constants';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { Stack } from '@onefootprint/ui';
import noop from 'lodash/fp/noop';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { checkIsPhoneValid, getLogger } from '../../../../utils';
import EmailPreview from '../../../email-preview';
import PhoneForm from '../../../phone-form';
import { useIdentify } from '../../queries';
import { useIdentifyMachine } from '../../state';
import type { HeaderProps } from '../../types';

type StepPhoneProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const { logError } = getLogger('auth-phone-identification');

const StepPhone = ({ children, Header }: StepPhoneProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { phoneNumber, email, sandboxId },
    obConfigAuth,
    config,
  } = state.context;
  const { t } = useTranslation('identify');
  const mutIdentify = useIdentify({ obConfigAuth, sandboxId });
  const showRequestErrorToast = useRequestErrorToast();

  const options = COUNTRIES;

  const handlePhoneValidation = (phone: string) =>
    checkIsPhoneValid(phone, config?.isLive === false);

  const handleChangeEmail = () => {
    send({ type: 'identifyReset' });
  };

  const handleSubmit = (formData: { phoneNumber: string }) => {
    const phoneFromForm = formData.phoneNumber;
    mutIdentify.mutate(
      { identifier: { phoneNumber: phoneFromForm } },
      {
        onError: error => {
          logError(
            'Error while identify user on phone-identification page:',
            error,
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
