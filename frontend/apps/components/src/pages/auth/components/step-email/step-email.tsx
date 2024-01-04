import { useRequestErrorToast, useTranslation } from '@onefootprint/hooks';
import { EmailForm, LegalFooter, StepHeader } from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import React from 'react';

import { useIdentify } from '../../hooks';
import { useAuthMachine } from '../../state';

type StepEmailProps = { children?: JSX.Element | null };

const noop = () => undefined;

const StepEmail = ({ children }: StepEmailProps) => {
  const [state, send] = useAuthMachine();
  const {
    identify: { email, sandboxId },
    obConfigAuth,
    config: { logoUrl, orgName },
    showLogo,
  } = state.context;
  const { t } = useTranslation('pages.auth');
  const identifyMutation = useIdentify();
  const showRequestErrorToast = useRequestErrorToast();

  const handleSubmit = (formData: { email: string }) => {
    const { email: emailFromForm } = formData;
    identifyMutation.mutate(
      {
        identifier: { email: emailFromForm },
        obConfigAuth,
        sandboxId,
      },
      {
        onError: error => {
          console.error(
            `Error while identifying user on email-identification page: ${getErrorMessage(
              error,
            )}`,
          );
          showRequestErrorToast(error);
        },
        onSuccess: res => {
          send({
            type: 'identified',
            payload: {
              availableChallengeKinds: res.availableChallengeKinds,
              email: emailFromForm,
              hasSyncablePassKey: res.hasSyncablePassKey,
              isUnverified: res.isUnverified,
              successfulIdentifier: { email: emailFromForm },
              userFound: res.userFound,
            },
          });
        },
      },
    );
  };

  return (
    <>
      <StepHeader
        leftButton={{ variant: 'close' }}
        logoUrl={logoUrl ?? undefined}
        orgName={orgName}
        showLogo={showLogo}
        subtitle={t('email-step.header.subtitle')}
        title={t('email-step.header.title')}
      />
      <EmailForm
        defaultEmail={email}
        isLoading={identifyMutation.isLoading}
        onSubmit={identifyMutation.isLoading ? noop : handleSubmit}
        texts={{
          cta: t('email-step.form.cta'),
          emailIsRequired: t('email-step.form.input-required'),
          emailLabel: t('email-step.form.input-label'),
          emailPlaceholder: t('email-step.form.input-placeholder'),
        }}
      />
      <LegalFooter descriptionKey="pages.auth.email-legal-footer" />
      {children}
    </>
  );
};

export default StepEmail;
