import type { IdentifyResponse } from '@onefootprint/types';
import React from 'react';

import { useEffectOnceStrict } from '@/src/hooks';

import Loading from '../../app/user/loading';
import { useIdentify } from '../identify/queries';

type IdentifyUserProps = {
  authToken: string;
  onError: (error: unknown) => void;
  onSuccess: (res: IdentifyResponse) => void;
};

const IdentifyUser = ({ authToken, onError, onSuccess }: IdentifyUserProps) => {
  const mutIdentify = useIdentify({});

  useEffectOnceStrict(() => {
    mutIdentify.mutate({ identifier: { authToken } }, { onError, onSuccess });
  });

  return <Loading />;
};

export default IdentifyUser;
