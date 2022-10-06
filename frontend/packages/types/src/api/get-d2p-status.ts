import { D2PStatus } from '../data';

export type GetD2PRequest = {
  scopedAuthToken: string;
};

export type GetD2PResponse = {
  status: D2PStatus;
};
