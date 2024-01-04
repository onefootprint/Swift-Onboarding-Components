import { COUNTRIES } from '@onefootprint/global-constants';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import {
  checkIsPhoneValid,
  EmailPreview,
  PhoneForm,
  StepHeader,
} from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import { Stack } from '@onefootprint/ui';
import React from 'react';

import { useIdentify } from '../../hooks';
import { useAuthMachine } from '../../state';

type StepPhoneProps = { children?: JSX.Element | null };

const noop = () => undefined;

const StepPhone = ({ children }: StepPhoneProps) => {
  const [state, send] = useAuthMachine();
  const {
    identify: { phoneNumber, email, sandboxId },
    obConfigAuth,
    showLogo,
    config: { logoUrl, orgName, isLive },
  } = state.context;
  const { t } = useTranslation('pages.auth.phone-step');
  const identifyMutation = useIdentify();
  const showRequestErrorToast = useRequestErrorToast();

  const options = COUNTRIES;

  const handlePhoneValidation = (phone: string) =>
    checkIsPhoneValid(phone, !isLive);

  const handleChangeEmail = () => {
    send({ type: 'identifyReset' });
  };

  const handleHeaderBackClick = () => {
    send({ type: 'navigatedToPrevPage' });
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
        <StepHeader
          leftButton={{ variant: 'back', onBack: handleHeaderBackClick }}
          logoUrl={logoUrl ?? undefined}
          orgName={orgName}
          showLogo={showLogo}
          subtitle={t('subtitle')}
          title={t('title')}
        />
        <EmailPreview
          email={email}
          onChange={handleChangeEmail}
          textCta={t('change-cta')}
        />
        <PhoneForm
          defaultPhone={phoneNumber}
          isLoading={identifyMutation.isLoading}
          onSubmit={identifyMutation.isLoading ? noop : handleSubmit}
          options={options}
          validator={handlePhoneValidation}
          texts={{
            cta: t('form.cta'),
            phoneInvalid: t('form.input-invalid'),
            phoneLabel: t('form.input-label'),
            phoneRequired: t('form.input-required'),
          }}
        />
      </Stack>
      {children}
    </>
  );
};

export default StepPhone;
