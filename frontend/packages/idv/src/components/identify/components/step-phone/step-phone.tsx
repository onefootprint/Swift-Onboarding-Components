import { COUNTRIES } from '@onefootprint/global-constants';
import { useRequestErrorToast } from '@onefootprint/hooks';
import noop from 'lodash/fp/noop';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { checkIsPhoneValid, getLogger } from '../../../../utils';
import { useL10nContext } from '../../../l10n-provider';
import { useIdentify } from '../../queries';
import { useIdentifyMachine } from '../../state';
import { SuccessfulIdentifier } from '../../state/types';
import { isAuthFlow, isPhoneVerificationRequired } from '../../state/utils';
import type { HeaderProps } from '../../types';
import getTokenScope from '../../utils/token-scope';
import PhonePageStructure from '../phone-page-structure';

type StepPhoneProps = { Header: (props: HeaderProps) => JSX.Element };

const { logError, logInfo } = getLogger({ location: 'step-phone' });

const StepPhone = ({ Header }: StepPhoneProps) => {
  const [state, send] = useIdentifyMachine();
  const { sandboxId, phoneNumber, email, obConfigAuth, config } = state.context;
  const { t } = useTranslation('identify');
  const scope = getTokenScope(state.context.variant);
  const mutIdentify = useIdentify({ obConfigAuth, sandboxId, scope });
  const showRequestErrorToast = useRequestErrorToast();
  const l10n = useL10nContext();

  const options = COUNTRIES;

  const handlePhoneValidation = (phone: string) => {
    const isPhoneValid = checkIsPhoneValid(phone, config?.isLive === false);
    if (!isPhoneValid) logInfo('Phone number is not valid');
    return isPhoneValid;
  };

  const handleChangeEmail = () => send({ type: 'navigatedToPrevPage' });

  const handleSubmit = (phoneFromForm: string) => {
    mutIdentify.mutate(
      { phoneNumber: phoneFromForm },
      {
        onError: error => {
          logError('Error while identify user on step-phone page:', error);
          showRequestErrorToast(error);
        },
        onSuccess: res => {
          const userFound = !!res.user;
          const successfulIdentifiers = userFound ? [SuccessfulIdentifier.phone] : undefined;
          send({
            type: 'identifyResult',
            payload: {
              user: res.user,
              phoneNumber: phoneFromForm,
              successfulIdentifiers,
            },
          });
        },
      },
    );
  };

  return (
    <PhonePageStructure
      countries={options}
      defaultPhone={phoneNumber?.value}
      email={email?.value}
      Header={Header}
      isLoading={mutIdentify.isLoading}
      l10n={l10n}
      onChangeEmailClick={handleChangeEmail}
      onSubmit={mutIdentify.isLoading ? noop : handleSubmit}
      phoneValidator={handlePhoneValidation}
      texts={{
        headerTitle: t('phone-step.title'),
        headerSubtitle: t('phone-step.subtitle'),
        cta:
          isPhoneVerificationRequired(state.context) || isAuthFlow(state.context.variant)
            ? t('phone-step.verify-with-sms')
            : t('continue'),
        emailChangeCta: t('change'),
        phoneInvalid: t('phone-step.form.input-invalid'),
        phoneLabel: t('phone-number'),
        phoneRequired: t('phone-step.form.input-required'),
      }}
    />
  );
};

export default StepPhone;
