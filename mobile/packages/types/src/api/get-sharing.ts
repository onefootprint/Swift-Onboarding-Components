import type { CollectedDataOption } from '../data';

export type GetSharingRequest = {};

export type GetSharingResponse = {
  orgName: string;
  logoUrl: string;
  canAccessData: CollectedDataOption[];
}[];
