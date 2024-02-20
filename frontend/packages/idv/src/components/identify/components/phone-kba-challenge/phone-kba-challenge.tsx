import { COUNTRIES } from '@onefootprint/global-constants';
import { useRequestErrorToast } from '@onefootprint/hooks';
import noop from 'lodash/fp/noop';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { checkIsPhoneValid, getLogger } from '../../../../utils';
import { useL10nContext } from '../../../l10n-provider';
import { useIdentifyKba } from '../../queries';
import { useIdentifyMachine } from '../../state';
import type { HeaderProps } from '../../types';
import PhonePageStructure from '../phone-page-structure';

type PhoneKbaChallengeProps = { Header: (props: HeaderProps) => JSX.Element };

const { logError } = getLogger('phone-kba-challenge');

const PhoneKbaChallenge = ({ Header }: PhoneKbaChallengeProps) => {
  const [state, send] = useIdentifyMachine();
  const {
    identify: { phoneNumber, user },
    config,
  } = state.context;
  const { t } = useTranslation('identify');
  const mutIdentifyKba = useIdentifyKba();
  const showRequestErrorToast = useRequestErrorToast();
  const l10n = useL10nContext();
  const options = COUNTRIES;

  const handlePhoneValidation = (phone: string) =>
    checkIsPhoneValid(phone, config?.isLive === false);

  const handleSubmit = (phoneFromForm: string) => {
    if (!user?.token) {
      logError('Unable to challenge phone number without user token');
      showRequestErrorToast(t('phone-challenge-error-no-token'));
      return;
    }

    mutIdentifyKba.mutate(
      { authToken: user.token, 'id.phone_number': phoneFromForm },
      {
        onError: err => {
          logError('Error while identify user on phone-kba-challenge', err);
          showRequestErrorToast(t('phone-incorrect'));
        },
        onSuccess: res => {
          send({ type: 'kbaSucceeded', payload: { identifyToken: res.token } });
        },
      },
    );
  };

  return (
    <PhonePageStructure
      countries={options}
      defaultPhone={phoneNumber}
      Header={Header}
      isLoading={mutIdentifyKba.isLoading}
      l10n={l10n}
      onSubmit={mutIdentifyKba.isLoading ? noop : handleSubmit}
      phoneValidator={handlePhoneValidation}
      texts={{
        headerTitle: t('confirm-phone-number'),
        headerSubtitle: t('before-email-code-confirmation', {
          number: user?.scrubbedPhone!.slice(-4),
        }),
        cta: t('continue'),
        emailChangeCta: t('change'),
        phoneInvalid: t('phone-step.form.input-invalid'),
        phoneLabel: t('phone-number'),
        phoneRequired: t('phone-step.form.input-required'),
      }}
    />
  );
};

export default PhoneKbaChallenge;
