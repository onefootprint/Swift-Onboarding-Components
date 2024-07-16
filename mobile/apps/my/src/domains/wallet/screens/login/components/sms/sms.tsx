import type { Identifier } from '@onefootprint/types';
import React, { useEffect } from 'react';

import Content from './components/content';
import Loading from './components/loading';
import useLoginChallenge from './hooks/use-login-challenge';

type SmsProps = {
  isApple: boolean;
  identifier: Identifier;
  identifiedAuthToken: string;
  onSuccess: (authToken) => void;
};

const Sms = ({ isApple, identifier, identifiedAuthToken, onSuccess }: SmsProps) => {
  const { isLoading, data, mutate } = useLoginChallenge();

  const createChallenge = () => {
    mutate({ identifier, authToken: identifiedAuthToken });
  };

  useEffect(createChallenge, []);

  return (
    <>
      {isLoading && <Loading />}
      {data && (
        <Content
          isApple={isApple}
          challengeToken={data.challengeData.challengeToken}
          onSuccess={onSuccess}
          phoneNumber={data.challengeData.scrubbedPhoneNumber}
        />
      )}
    </>
  );
};

export default Sms;
