import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import type { IdentifyResponse } from '@onefootprint/types';
import React from 'react';

import { EmailForm, LegalFooter, StepHeader } from '../../../../components';
import useIdentify from '../../../../hooks/api/hosted/identify/use-identify';
import Logger from '../../../../utils/logger';
import { useIdentifyMachine } from '../../components/machine-provider';
import SandboxOutcomeFooter from '../../components/sandbox-outcome-footer';

type FormData = {
  email: string;
};

const EmailIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const { t } = useTranslation('pages.email-identification');
  const {
    identify: { email, sandboxId },
    obConfigAuth,
    config: { logoUrl, orgName },
    showLogo,
    overallOutcome,
  } = state.context;
  const identifyMutation = useIdentify();
  const { isLoading } = identifyMutation;
  const showRequestErrorToast = useRequestErrorToast();

  const handleSubmit = (formData: FormData) => {
    const { email: emailFromForm } = formData;
    if (identifyMutation.isLoading) {
      return;
    }

    identifyMutation.mutate(
      {
        identifier: { email: emailFromForm },
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
              userFound,
              isUnverified,
              email: emailFromForm,
              successfulIdentifier: { email: emailFromForm },
              hasSyncablePassKey,
              availableChallengeKinds,
            },
          });
        },
        onError: error => {
          Logger.error(
            `Error while identifying user on email-identification page: ${getErrorMessage(
              error,
            )}`,
            'email-identification',
          );
          showRequestErrorToast(error);
        },
      },
    );
  };

  return (
    <>
      <StepHeader
        showLogo={showLogo}
        orgName={orgName}
        logoUrl={logoUrl ?? undefined}
        leftButton={{ variant: 'close' }}
        subtitle={t('header.subtitle')}
        title={t('header.title')}
      />
      <EmailForm
        defaultEmail={email}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        texts={{
          cta: t('form.cta'),
          emailIsRequired: t('form.email.errors.required'),
          emailLabel: t('form.email.label'),
          emailPlaceholder: t('form.email.placeholder'),
        }}
      />
      <LegalFooter descriptionKey="components.legal-footer.label" />
      <SandboxOutcomeFooter
        sandboxId={sandboxId}
        overallOutcome={overallOutcome}
      />
    </>
  );
};

export default EmailIdentification;
