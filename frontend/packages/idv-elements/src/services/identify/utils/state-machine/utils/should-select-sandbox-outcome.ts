import type { MachineContext } from '../types';

const shouldSelectSandboxOutcome = (context: MachineContext) =>
  context.config?.isLive === false && !context.isTransfer;

export default shouldSelectSandboxOutcome;
