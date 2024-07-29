import React from 'react';

import { useIdvMachine } from '../../hooks';
import SandboxOutcomeContainer from './components/sandbox-outcome-container';
import type { SandboxOutcomeFormData } from './types';

const SandboxOutcome = () => {
  const [state, send] = useIdvMachine();
  const { config, authToken } = state.context;

  const handleAfterSubmit = (formData: SandboxOutcomeFormData) => {
    const {
      testID,
      outcomes: { overallOutcome, idDocOutcome },
    } = formData;

    send({
      type: 'sandboxOutcomeSubmitted',
      payload: {
        sandboxId: testID,
        idDocOutcome: idDocOutcome?.value,
        overallOutcome: overallOutcome.value,
      },
    });
  };

  return <SandboxOutcomeContainer onSubmit={handleAfterSubmit} config={config} collectTestId={!authToken} />;
};

export default SandboxOutcome;
