import { BootstrapData } from 'src/idv.types';

export type MachineContext = {
  tenantPk: string;
  bootstrapData?: BootstrapData;
};

export type MachineEvents = {
  type: 'reset';
};
