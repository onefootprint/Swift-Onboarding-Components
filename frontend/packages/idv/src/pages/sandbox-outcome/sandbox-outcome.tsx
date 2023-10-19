import React from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';
import SandboxOutcomeContainer from './components/sandbox-outcome-container';
import type { SandboxOutcomeFormData } from './types';

const SandboxOutcome = () => {
  const [state, send] = useIdvMachine();
  const { config } = state.context;

  const handleAfterSubmit = (formData: SandboxOutcomeFormData) => {
    const {
      testID,
      outcomes: { overallOutcome, idDocOutcome },
    } = formData;

    send({
      type: 'sandboxOutcomeSubmitted',
      payload: {
        sandboxId: testID,
        idDocOutcome,
        overallOutcome,
      },
    });
  };

  return (
    <SandboxOutcomeContainer onSubmit={handleAfterSubmit} config={config} />
  );
};

export default SandboxOutcome;
