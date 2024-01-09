import type { MachineContext } from '../types';

const shouldBootstrap = (context: MachineContext) =>
  Object.values(context.bootstrapData).filter(v => !!v).length > 0;

export default shouldBootstrap;
