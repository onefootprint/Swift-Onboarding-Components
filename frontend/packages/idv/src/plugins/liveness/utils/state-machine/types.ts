import type { CommonIdvContext } from '../../../../utils/state-machine';

export type MachineContext = {
  idvContext: CommonIdvContext;
};

export type MachineEvents = { type: 'skipped' } | { type: 'succeeded' } | { type: 'completed' };
