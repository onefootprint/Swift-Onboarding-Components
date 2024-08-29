import { IdDocOutcome, IdVerificationOutcome } from '@onefootprint/types';
import { useIdvMachine } from '../../hooks';
import SandboxOutcomeContainer from './components/sandbox-outcome-container';
import type { SandboxOutcomeFormData } from './types';

const SandboxOutcome = () => {
  const [state, send] = useIdvMachine();
  const { config, authToken } = state.context;

  console.log('> authToken', authToken);

  const handleAfterSubmit = ({
    testID,
    overallOutcome,
    idDocOutcome,
    docVerificationOutcome,
  }: SandboxOutcomeFormData) => {
    send({
      type: 'sandboxOutcomeSubmitted',
      payload: {
        sandboxId: testID,
        idDocOutcome: docVerificationOutcome === IdVerificationOutcome.real ? IdDocOutcome.real : idDocOutcome,
        overallOutcome,
      },
    });
  };

  return <SandboxOutcomeContainer onSubmit={handleAfterSubmit} config={config} collectTestId={!authToken} />;
};

export default SandboxOutcome;
