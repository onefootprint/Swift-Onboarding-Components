import { BootstrapData } from './bootstrap-data';
import UserDataAttribute from './user-data-attribute';

export type BusinessBoKycData = {
  name: string;
  inviter: {
    [UserDataAttribute.firstName]: string;
    [UserDataAttribute.lastName]: string;
  };
  invited: BootstrapData;
};
