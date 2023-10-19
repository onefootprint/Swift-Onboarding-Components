import { COUNTRIES } from '@onefootprint/global-constants';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { IdentifyResponse } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React from 'react';

import useIdentify from '../../../../hooks/api/hosted/identify/use-identify';
import { useIdentifyMachine } from '../../components/machine-provider';
import SandboxOutcomeFooter from '../../components/sandbox-outcome-footer';
import EmailPreview from './components/email-preview';
import Form from './components/form';
import checkIsPhoneValid from './components/form/utils/check-is-phone-valid';
import Header from './components/header';

type FormData = {
  phoneNumber: string;
};

const PhoneIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { phoneNumber, email, sandboxId },
    obConfigAuth,
    showLogo,
    config: { logoUrl, orgName, isLive },
  } = state.context;
  const identifyMutation = useIdentify();
  const { isLoading } = identifyMutation;
  const showRequestErrorToast = useRequestErrorToast();
  const flags = useFlags();
  const { IdvPhoneInputRestrictedCountries } = flags;
  const restrictedCountries = new Set(IdvPhoneInputRestrictedCountries);
  const options = COUNTRIES.filter(
    country => !restrictedCountries.has(country.value),
  );

  const validatePhone = (phone: string) => checkIsPhoneValid(phone, !isLive);

  const handleSubmit = (formData: FormData) => {
    const phoneFromForm = formData.phoneNumber;
    if (identifyMutation.isLoading) {
      return;
    }

    // First we try to identify the user via phone number before sending any challenges
    identifyMutation.mutate(
      {
        identifier: { phoneNumber: phoneFromForm },
        obConfigAuth,
        sandboxId,
      },
      {
        onSuccess: ({
          userFound,
          availableChallengeKinds,
          hasSyncablePassKey,
        }: IdentifyResponse) => {
          send({
            type: 'identified',
            payload: {
              phoneNumber: phoneFromForm,
              userFound,
              successfulIdentifier: { phoneNumber: phoneFromForm },
              availableChallengeKinds,
              hasSyncablePassKey,
            },
          });
        },
        onError: error => {
          console.error(
            'Error while identify user on phone-identification page',
            getErrorMessage(error),
          );
          showRequestErrorToast(error);
        },
      },
    );
  };

  const handleChangeEmail = () => {
    send({ type: 'identifyReset' });
  };

  return (
    <>
      <Stack direction="column" gap={8}>
        <Header
          showLogo={showLogo}
          orgName={orgName}
          logoUrl={logoUrl ?? undefined}
        />
        <EmailPreview email={email} onChange={handleChangeEmail} />
        <Form
          onSubmit={handleSubmit}
          isLoading={isLoading}
          defaultPhone={phoneNumber}
          validator={validatePhone}
          options={options}
        />
      </Stack>
      <SandboxOutcomeFooter sandboxId={sandboxId} />
    </>
  );
};

export default PhoneIdentification;
