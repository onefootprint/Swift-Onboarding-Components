import { useRequestErrorToast } from '@onefootprint/hooks';
import { EmailForm, getLogger, LegalFooter } from '@onefootprint/idv';
import noop from 'lodash/fp/noop';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { useIdentify } from '@/src/queries';
import type { HeaderProps } from '@/src/types';

import { useIdentifyMachine } from '../../state';

type StepEmailProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const { logError } = getLogger('step-email');

const StepEmail = ({ children, Header }: StepEmailProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { email, sandboxId },
    obConfigAuth,
  } = state.context;
  const { t } = useTranslation('common');
  const mutIdentify = useIdentify({ obConfigAuth, sandboxId });
  const showRequestErrorToast = useRequestErrorToast();

  const handleSubmit = (formData: { email: string }) => {
    const { email: emailFromForm } = formData;
    mutIdentify.mutate(
      { identifier: { email: emailFromForm } },
      {
        onError: error => {
          logError(
            'Error while identifying user on email-identification page:',
            error,
          );
          showRequestErrorToast(error);
        },
        onSuccess: res => {
          send({
            type: 'identified',
            payload: {
              user: res.user,
              email: emailFromForm,
              successfulIdentifier: { email: emailFromForm },
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
        isLoading={mutIdentify.isLoading}
        onSubmit={mutIdentify.isLoading ? noop : handleSubmit}
        texts={{
          cta: t('continue'),
          emailIsRequired: t('email-step.form.input-required'),
          emailLabel: t('email'),
          emailPlaceholder: t('email-step.form.input-placeholder'),
        }}
      />
      <LegalFooter descriptionKey="common:email-legal-footer" />
      {children}
    </>
  );
};

export default StepEmail;
