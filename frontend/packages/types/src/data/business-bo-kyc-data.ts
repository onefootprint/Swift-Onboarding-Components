import { BootstrapData } from './bootstrap-data';

export type BusinessBoKycData = {
  name: string;
  inviter: {
    firstName: string;
    lastName: string;
  };
  invited: BootstrapData;
};
