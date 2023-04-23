import { MachineContext } from '../types';

const shouldSelectSandboxOutcome = (context: MachineContext) =>
  context.onboarding.config?.isLive === false;

export default shouldSelectSandboxOutcome;
