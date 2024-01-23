import type { D2PMeta, D2PStatus, L10n } from '../data';

export type GetD2PRequest = {
  scopedAuthToken: string;
};

export type GetD2PResponse = {
  status: D2PStatus;
  meta: D2PMeta;
  l10n: L10n;
};
