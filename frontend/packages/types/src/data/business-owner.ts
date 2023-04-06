import type { EntityStatus } from './entity';

export type BusinessOwner = {
  id?: string;
  kind: 'primary' | 'secondary';
  ownershipStake: number;
  status?: EntityStatus;
};
