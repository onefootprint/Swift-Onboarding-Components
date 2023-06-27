import { OnboardingRequirementKind } from '@onefootprint/types';
import React, { useState } from 'react';

import IdDoc from '@/components/id-doc';

import Completed from '../completed';

type RouterProps = {
  authToken: string;
};

const Router = ({ authToken }: RouterProps) => {
  const [finished, setFinished] = useState(false);

  const handleDone = () => {
    setFinished(true);
  };

  return finished ? (
    <Completed authToken={authToken} />
  ) : (
    <IdDoc
      onDone={handleDone}
      authToken={authToken}
      requirement={{
        kind: OnboardingRequirementKind.idDoc,
        shouldCollectSelfie: true,
        shouldCollectConsent: true,
      }}
    />
  );
};

export default Router;
