import { getErrorMessage } from '@onefootprint/request';
import type { IdentifyResponse } from '@onefootprint/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { EmailForm, LegalFooter, StepHeader } from '../../../../components';
import useIdentify from '../../../../hooks/api/hosted/identify/use-identify';
import useIdvRequestErrorToast from '../../../../hooks/ui/use-idv-request-error-toast';
import Logger from '../../../../utils/logger';
import { useIdentifyMachine } from '../../components/machine-provider';
import SandboxOutcomeFooter from '../../components/sandbox-outcome-footer';

type FormData = {
  email: string;
};

const EmailIdentification = () => {
  const [state, send] = useIdentifyMachine();
  const { t } = useTranslation('idv', {
    keyPrefix: 'identify.pages.email-identification',
  });
  const {
    identify: { email, sandboxId },
    obConfigAuth,
    config: { logoUrl, orgName },
    showLogo,
    overallOutcome,
  } = state.context;
  const identifyMutation = useIdentify();
  const { isLoading } = identifyMutation;
  const showRequestErrorToast = useIdvRequestErrorToast();

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
        onSuccess: ({ user }: IdentifyResponse) => {
          send({
            type: 'identified',
            payload: {
              userFound: !!user,
              isUnverified: !!user?.isUnverified,
              email: emailFromForm,
              successfulIdentifier: { email: emailFromForm },
              hasSyncablePassKey: user?.hasSyncablePasskey,
              availableChallengeKinds: user?.availableChallengeKinds,
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
      <LegalFooter descriptionKey="identify.components.legal-footer.label" />
      <SandboxOutcomeFooter
        sandboxId={sandboxId}
        overallOutcome={overallOutcome}
      />
    </>
  );
};

export default EmailIdentification;
