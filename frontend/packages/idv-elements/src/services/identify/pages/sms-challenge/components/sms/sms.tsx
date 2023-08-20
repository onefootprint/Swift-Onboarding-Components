import { useTranslation } from '@onefootprint/hooks';
import { ChallengeData, ChallengeKind } from '@onefootprint/types';
import React, { useState } from 'react';

import PinVerification from '../../../../components/pin-verification';
import useIdentifyMachine from '../../../../hooks/use-identify-machine';
import getScrubbedPhoneNumber from '../../../../utils/get-scrubbed-phone-number';

const IS_TEST = typeof jest !== 'undefined';
const SUCCESS_EVENT_DELAY_MS = IS_TEST ? 0 : 1500;

const Sms = () => {
  const { t } = useTranslation('pages.sms-challenge');
  const [state, send] = useIdentifyMachine();
  const {
    identify: { phoneNumber, successfulIdentifier },
  } = state.context;
  const [challengeData, setChallengeData] = useState<ChallengeData>();

  // Either scrub the phone number collected from the previous steps, or use the
  // challenge data scrubbed number
  const scrubbedPhoneNumber = getScrubbedPhoneNumber({
    successfulIdentifier,
    phoneNumber,
    challengeData,
  });
  // Sometimes, a new challenge may not have been re-generated upon mount because
  // of rate limiting (they recently sent a code), to avoid shifting the components
  // up and down, still show a generic title if we don't have the scrubbed phone number.
  // The user can always resend the code if they didn't already receive it.
  const title = scrubbedPhoneNumber
    ? t('prompt-with-phone', { scrubbedPhoneNumber })
    : t('prompt-without-phone');

  const handleChallengeSuceed = (authToken: string) => {
    setTimeout(() => {
      send({
        type: 'challengeSucceeded',
        payload: {
          authToken,
        },
      });
    }, SUCCESS_EVENT_DELAY_MS);
  };

  const handleReceiveChallengeData = (data: ChallengeData) => {
    setChallengeData(data);
  };

  return (
    <PinVerification
      title={title}
      onReceiveChallenge={handleReceiveChallengeData}
      onChallengeSucceed={handleChallengeSuceed}
      preferredChallengeKind={ChallengeKind.sms}
    />
  );
};

export default Sms;
