import CdoToDiMap from './cdo-to-di-map';
import { DataIdentifier } from './di';
import { Onboarding } from './onboarding';
import { VaultValue } from './vault';

export type EntityVault = Partial<Record<DataIdentifier, VaultValue>>;

export enum EntityKind {
  business = 'business',
  person = 'person',
}

export enum EntityStatus {
  failed = 'fail',
  incomplete = 'incomplete',
  pending = 'pending',
  verified = 'pass',
}

export type Entity = {
  attributes: DataIdentifier[];
  id: string;
  isPortable: boolean;
  kind: EntityKind;
  onboarding?: Onboarding;
  orderingId: number;
  requiresManualReview: boolean;
  startTimestamp: string;
  status: EntityStatus;
  vault?: EntityVault;
};

export const getEntityStatus = (entity: Entity) => {
  if (entity.onboarding?.isAuthorized && entity.onboarding?.status) {
    return entity.onboarding.status as unknown as EntityStatus;
  }
  return EntityStatus.incomplete;
};

export const getEntityManualReview = (entity: Entity) => {
  const userStatus = getEntityStatus(entity);
  return (
    (entity.onboarding?.requiresManualReview &&
      userStatus !== EntityStatus.incomplete) ||
    false
  );
};

export const getEntityOnboardingCanAccessAttributes = (
  onboarding: Onboarding,
): DataIdentifier[] =>
  onboarding.canAccessData
    .map(collectDataOption => CdoToDiMap[collectDataOption])
    .flat();
