import { IdDocRequirement } from '@onefootprint/types';
import { useMachine } from '@xstate/react';
import React, { useEffect } from 'react';

import DocSelection from './screens/doc-selection';
import createMachine from './utils/state-machine';
// import DriversLicense from './screens/drivers-license';
// import Passport from './screens/passport';
// import Selfie from './screens/selfie';

export type IdDocProps = {
  requirement: IdDocRequirement;
  authToken: string;
  onDone: () => void;
};

const IdDoc = ({ authToken, requirement, onDone }: IdDocProps) => {
  const [state, send] = useMachine(() => createMachine({ requirement }));

  useEffect(() => {
    if (state.done) {
      // TODO: REMOVE
      console.log(authToken);
      onDone();
    }
  }, [state, onDone]);

  if (state.matches('docSelection')) {
    return (
      <DocSelection
        onSubmit={(countryCode, documentType) => {
          send('countryAndTypeSubmitted', {
            countryCode,
            documentType,
          });
        }}
      />
    );
  }
};

export default IdDoc;
