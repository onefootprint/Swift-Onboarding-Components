import type { DataIdentifier } from './di';
import type { EntityStatus } from './entity';

export type BusinessOwner = {
  fpId?: string;
  kind: 'primary' | 'secondary';
  ownershipStake?: number; // Can be empty before they have entered anything
  status?: EntityStatus;
  source?: 'hosted' | 'tenant';
  name?: string;
};

export type BusinessOwner2 = {
  id: string;
  hasLinkedUser: boolean;
  isAuthedUser: boolean;
  isMutable: boolean;
  ownershipStake: number;
  decryptedData: Partial<Record<DataIdentifier, string>>;
  populatedData: DataIdentifier[];
};
