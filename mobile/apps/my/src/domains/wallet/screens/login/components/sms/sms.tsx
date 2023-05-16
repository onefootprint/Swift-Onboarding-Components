import { Identifier } from '@onefootprint/types';
import React, { useEffect } from 'react';

import Content from './components/content';
import Loading from './components/loading';
import useLoginChallenge from './hooks/use-login-challenge';

type SmsProps = {
  identifier: Identifier;
  onSuccess: (authToken) => void;
};

const Sms = ({ identifier, onSuccess }: SmsProps) => {
  const { isLoading, data, mutate } = useLoginChallenge();

  const createChallenge = () => {
    mutate(identifier);
  };
  useEffect(createChallenge, []);

  return (
    <>
      {isLoading && <Loading />}
      {data && (
        <Content
          challengeToken={data.challengeData.challengeToken}
          onSuccess={onSuccess}
          phoneNumber={data.challengeData.scrubbedPhoneNumber}
        />
      )}
    </>
  );
};

export default Sms;
