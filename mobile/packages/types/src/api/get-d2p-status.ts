import { D2PStatus } from '../data';

export type GetD2PRequest = {
  scopedAuthToken: string;
};

export type GetD2PResponse = {
  status: D2PStatus;
  meta: {
    sessionId?: string; // bifrost session id
    opener?: string; // the device type that opened/generated the d2p session
  };
};
