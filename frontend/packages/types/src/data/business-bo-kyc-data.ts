import type { IdDIData } from './id-di-data';

export type BusinessBoKycData = {
  name: string;
  inviter: {
    firstName: string;
    lastName: string;
  };
  /** The basic data for the secondary BO, provided by the priamry BO. */
  invitedData: IdDIData;
};
