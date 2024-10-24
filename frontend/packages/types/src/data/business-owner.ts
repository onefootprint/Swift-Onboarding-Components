import type { EntityStatus } from './entity';

export type BusinessOwner = {
  fpId?: string;
  kind: 'primary' | 'secondary';
  ownershipStake?: number; // Can be empty before they have entered anything
  status?: EntityStatus;
  source?: 'hosted' | 'tenant';
  name?: string;
};
