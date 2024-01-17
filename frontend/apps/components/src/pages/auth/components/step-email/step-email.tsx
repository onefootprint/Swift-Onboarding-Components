import { useRequestErrorToast } from '@onefootprint/hooks';
import { EmailForm, LegalFooter } from '@onefootprint/idv';
import { getErrorMessage } from '@onefootprint/request';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useIdentify } from '../../hooks';
import { useAuthMachine } from '../../state';
import type { HeaderProps } from '../../types';

type StepEmailProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const noop = () => undefined;

const StepEmail = ({ children, Header }: StepEmailProps) => {
  const [state, send] = useAuthMachine();
  const {
    identify: { email, sandboxId },
    obConfigAuth,
  } = state.context;
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.auth',
  });
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
      <Header
        subtitle={t('email-step.header.subtitle')}
        title={t('email-step.header.title')}
      />
      <EmailForm
        defaultEmail={email}
        isLoading={identifyMutation.isLoading}
        onSubmit={identifyMutation.isLoading ? noop : handleSubmit}
        texts={{
          cta: t('continue'),
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
