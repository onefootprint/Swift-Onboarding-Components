import { useRequestErrorToast } from '@onefootprint/hooks';
import noop from 'lodash/fp/noop';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { getLogger } from '../../../../utils';
import LegalFooter from '../../../legal-footer';
import { useIdentify } from '../../queries';
import { useIdentifyMachine } from '../../state';
import { SuccessfulIdentifier } from '../../state/types';
import type { HeaderProps } from '../../types';
import getTokenScope from '../../utils/token-scope';
import EmailPageStructure from '../email-page-structure';

type StepEmailProps = {
  children?: JSX.Element | null;
  Header: (props: HeaderProps) => JSX.Element;
};

const { logError } = getLogger({ location: 'step-email' });

const StepEmail = ({ children, Header }: StepEmailProps) => {
  const [state, send] = useIdentifyMachine();
  const { sandboxId, email, obConfigAuth } = state.context;
  const { t } = useTranslation('identify');
  const scope = getTokenScope(state.context.variant);
  const mutIdentify = useIdentify({ obConfigAuth, sandboxId, scope });
  const showRequestErrorToast = useRequestErrorToast();

  const handleSubmit = (emailFromForm: string) => {
    mutIdentify.mutate(
      { email: emailFromForm },
      {
        onError: error => {
          logError(
            'Error while identifying user on email-identification page:',
            error,
          );
          showRequestErrorToast(error);
        },
        onSuccess: res => {
          const userFound = !!res.user;
          const successfulIdentifiers = userFound
            ? [SuccessfulIdentifier.email]
            : undefined;
          send({
            type: 'identifyResult',
            payload: {
              user: res.user,
              email: emailFromForm,
              successfulIdentifiers,
            },
          });
        },
      },
    );
  };

  return (
    <EmailPageStructure
      Header={Header}
      Footer={<LegalFooter />}
      onSubmit={mutIdentify.isLoading ? noop : handleSubmit}
      defaultEmail={email?.value}
      isLoading={mutIdentify.isLoading}
      texts={{
        headerTitle: t('email-step.title'),
        headerSubtitle: t('email-step.subtitle'),
        cta: t('continue'),
        emailIsRequired: t('email-is-required'),
        emailLabel: t('email'),
        emailPlaceholder: t('email-placeholder'),
      }}
    >
      {children}
    </EmailPageStructure>
  );
};

export default StepEmail;
