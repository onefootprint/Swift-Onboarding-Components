import React, { useState } from 'react';
import { UserData, UserDataAttribute } from 'src/utils/state-machine/types';

import { ChallengeKind } from '../../../../utils/state-machine/identify/types';
import useIdentifyMachine from '../../hooks/use-identify-machine';
import ChallengePicker from './components/challenge-picker';
import EmailIdentificationForm from './components/email-identification-form';
import EmailIdentificationHeader from './components/email-identification-header';
import useEmailIdentify from './hooks/use-email-identify';

type FormData = Required<Pick<UserData, UserDataAttribute.email>>;

const EmailIdentification = () => {
  const { identifyEmail, isLoading } = useEmailIdentify();
  const [state] = useIdentifyMachine();
  const {
    context: { device },
  } = state;

  const supportsBiometric =
    device.hasSupportForWebauthn && device.type === 'mobile';
  const [challengePickerVisible, setChallengePickerVisible] = useState(false);
  const [formData, setFormData] = useState({ [UserDataAttribute.email]: '' });

  const handleSelectSms = () => {
    identifyEmail(formData.email, ChallengeKind.sms);
  };

  const handleSelectBiometric = () => {
    identifyEmail(formData.email, ChallengeKind.biometric);
  };

  const handleChallengePickerClose = () => {
    setChallengePickerVisible(false);
  };

  const onSubmit = (data: FormData) => {
    setFormData(data);
    if (supportsBiometric) {
      setChallengePickerVisible(true);
    } else {
      identifyEmail(data.email, ChallengeKind.sms);
    }
  };

  return (
    <>
      <EmailIdentificationHeader />
      <EmailIdentificationForm onSubmit={onSubmit} isLoading={isLoading()} />
      {supportsBiometric && (
        <ChallengePicker
          open={challengePickerVisible}
          onClose={handleChallengePickerClose}
          onSelectSms={handleSelectSms}
          onSelectBiometric={handleSelectBiometric}
        />
      )}
    </>
  );
};

export default EmailIdentification;
