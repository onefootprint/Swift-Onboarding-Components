import React from 'react';

import useIdvMachine from '../../hooks/use-idv-machine';
import SandboxOutcomeContainer from './components/sandbox-outcome-container';
import type { SandboxOutcomeFormData } from './types';

const SandboxOutcome = () => {
  const [state, send] = useIdvMachine();
  const { config } = state.context;

  const handleAfterSubmit = (formData: SandboxOutcomeFormData) => {
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
