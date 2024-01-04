import { COUNTRIES } from '@onefootprint/global-constants';
import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { CountryCode, IdentifyResponse } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useFlags } from 'launchdarkly-react-client-sdk';
import React from 'react';

import { EmailPreview, PhoneForm, StepHeader } from '../../../../components';
import { useL10nContext } from '../../../../components/l10n-provider';
import useIdentify from '../../../../hooks/api/hosted/identify/use-identify';
import checkIsPhoneValid from '../../../../utils/check-is-phone-valid';
import { useIdentifyMachine } from '../../components/machine-provider';
import SandboxOutcomeFooter from '../../components/sandbox-outcome-footer';

type FormData = { phoneNumber: string };

const noop = () => undefined;

const PhoneIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { phoneNumber, email, sandboxId },
    obConfigAuth,
    showLogo,
    overallOutcome,
    config: { logoUrl, orgName, isLive },
  } = state.context;
  const identifyMutation = useIdentify();
  const showRequestErrorToast = useRequestErrorToast();
  const { t } = useTranslation('pages.phone-identification');
  const l10n = useL10nContext();
  const { IdvPhoneInputRestrictedCountries } = useFlags();
  const restrictedCountries = new Set<CountryCode>(
    IdvPhoneInputRestrictedCountries,
  );
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
          isUnverified,
          availableChallengeKinds,
          hasSyncablePassKey,
        }: IdentifyResponse) => {
          send({
            type: 'identified',
            payload: {
              phoneNumber: phoneFromForm,
              userFound,
              isUnverified,
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

  const handleHeaderBackClick = () => {
    send({ type: 'navigatedToPrevPage' });
  };

  const handleChangeEmail = () => {
    send({ type: 'identifyReset' });
  };

  return (
    <>
      <Stack direction="column" gap={8}>
        <StepHeader
          showLogo={showLogo}
          orgName={orgName}
          logoUrl={logoUrl ?? undefined}
          leftButton={{ variant: 'back', onBack: handleHeaderBackClick }}
          subtitle={t('subtitle')}
          title={t('title')}
        />
        <EmailPreview
          email={email}
          onChange={handleChangeEmail}
          textCta={t('email-card.cta')}
        />
        <PhoneForm
          onSubmit={identifyMutation.isLoading ? noop : handleSubmit}
          isLoading={identifyMutation.isLoading}
          defaultPhone={phoneNumber}
          validator={validatePhone}
          options={options}
          l10n={l10n}
          texts={{
            cta: t('form.cta'),
            phoneInvalid: t('form.phone.errors.invalid'),
            phoneLabel: t('form.phone.label'),
            phoneRequired: t('form.phone.errors.required'),
          }}
        />
      </Stack>
      <SandboxOutcomeFooter
        sandboxId={sandboxId}
        overallOutcome={overallOutcome}
      />
    </>
  );
};

export default PhoneIdentification;
