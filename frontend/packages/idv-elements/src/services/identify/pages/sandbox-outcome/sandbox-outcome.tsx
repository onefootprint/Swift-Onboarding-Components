import React from 'react';

import { useIdentifyMachine } from '../../components/identify-machine-provider';
import type { FormDataType } from './components/sandbox-outcome-container';
import SandboxOutcomeContainer from './components/sandbox-outcome-container';

const SandboxOutcome = () => {
  const [state, send] = useIdentifyMachine();
  const { config } = state.context;

  const handleAfterSubmit = (formData: FormDataType) => {
    send({
      type: 'sandboxOutcomeSubmitted',
      payload: {
        sandboxId: `${formData.outcomes.overallOutcome}${formData.testID}`,
        idDocOutcome: formData.outcomes.idDocOutcome,
      },
    });
  };

  return (
    <SandboxOutcomeContainer onSubmit={handleAfterSubmit} config={config} />
  );
};

export default SandboxOutcome;
