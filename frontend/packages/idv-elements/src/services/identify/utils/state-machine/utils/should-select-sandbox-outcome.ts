import { MachineContext } from '../types';

const shouldSelectSandboxOutcome = (context: MachineContext) =>
  !context.config?.isLive;

export default shouldSelectSandboxOutcome;
