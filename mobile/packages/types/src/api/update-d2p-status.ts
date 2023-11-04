import type { D2PStatusUpdate } from '../data';

export type UpdateD2PStatusRequest = {
  authToken: string; // scoped auth token
  status: D2PStatusUpdate;
};

export type UpdateD2PStatusResponse = {};
