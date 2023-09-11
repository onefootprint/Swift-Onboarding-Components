import type { MachineContext } from '../types';

const shouldSelectSandboxOutcome = (context: MachineContext) =>
  context.config?.isLive === false;

export default shouldSelectSandboxOutcome;
