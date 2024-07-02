import { AuthMethodKind } from '@onefootprint/types';
import type { ComponentProps } from 'react';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { UpdateVerify } from '../../../../components/identify';
import StepHeader from '../../../../components/step-header';
import useLogStateMachine from '../../../../hooks/ui/use-log-state-machine';
import { getLogger, trackAction } from '../../../../utils/logger';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';
import BasicInformation from '../basic-information';
import Confirm from '../confirm';
import Email from '../email';
import Init from '../init';
import LegalStatus from '../legal-status';
import Address from '../residential-address';
import Ssn from '../ssn';

const { logWarn, logError } = getLogger({ location: 'collect-kyc-router' });

const VerifyHeader: ComponentProps<typeof UpdateVerify>['Header'] = ({ title, subtitle, overrideLeftButton }) => (
  <StepHeader leftButton={overrideLeftButton!} subtitle={subtitle} title={title} />
);

const Router = ({ onDone }: { onDone: () => void }) => {
  const [state, send] = useCollectKycDataMachine();
  const { matches, context } = state;
  const isStateCompleted = matches('completed');
  useLogStateMachine('collect-kyc-data', state);
  const onBack = () => send({ type: 'navigatedToPrevPage' });
  const { t } = useTranslation('idv');
  const phoneValue = context.data['id.phone_number']?.value;
  const emailValue = context.data['id.email']?.value;

  useEffect(() => {
    if (isStateCompleted) {
      onDone();
      trackAction('kyc:completed');
    }
  }, [isStateCompleted, onDone]);

  if (matches('init')) return <Init />;
  if (matches('email')) return <Email />;
  if (matches('basicInformation')) return <BasicInformation />;
  if (matches('residentialAddress')) return <Address />;
  if (matches('usLegalStatus')) return <LegalStatus />;
  if (matches('ssn')) return <Ssn />;
  if (matches('confirm')) return <Confirm />;

  if (matches('addVerificationPhone') && phoneValue && context.authToken) {
    return (
      <UpdateVerify
        Header={VerifyHeader}
        headerTitle={t('identify.pages.sms-challenge.title')}
        headerSubtitle={
          <span data-dd-privacy="mask">
            {t('identify.pages.sms-challenge.prompt-with-phone', {
              scrubbedPhoneNumber: phoneValue,
            })}
          </span>
        }
        actionKind="add_primary"
        identifyVariant="verify"
        logError={logError}
        logWarn={logWarn}
        onBack={onBack}
        onChallengeVerificationSuccess={onBack}
        challengePayload={{
          authToken: context.authToken,
          kind: AuthMethodKind.phone,
          phoneNumber: phoneValue,
        }}
      />
    );
  }

  if (matches('addVerificationEmail') && emailValue && context.authToken) {
    return (
      <UpdateVerify
        Header={VerifyHeader}
        headerTitle={t('identify.pages.email-challenge.title')}
        headerSubtitle={
          <span data-dd-privacy="mask">
            {t('identify.pages.email-challenge.prompt-with-email', { email: emailValue })}
          </span>
        }
        actionKind="add_primary"
        identifyVariant="verify"
        logError={logError}
        logWarn={logWarn}
        onBack={onBack}
        onChallengeVerificationSuccess={onBack}
        challengePayload={{
          authToken: context.authToken,
          kind: AuthMethodKind.email,
          email: emailValue,
        }}
      />
    );
  }

  return null;
};

export default Router;
