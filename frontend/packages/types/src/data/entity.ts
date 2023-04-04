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
  pass = 'pass',
}

export type Entity = {
  attributes: DataIdentifier[];
  id: string;
  isPortable: boolean;
  kind: EntityKind;
  onboarding?: Onboarding;
  requiresManualReview: boolean;
  startTimestamp: string;
  status: EntityStatus;
  decryptedAttributes: EntityVault;
};

export const augmentEntityWithOnboardingInfo = (entity: Entity) => ({
  ...entity,
  requiresManualReview: getEntityManualReview(entity),
  status: getEntityStatus(entity),
  onboarding: entity.onboarding
    ? {
        ...entity.onboarding,
        canAccessAttributes: getEntityOnboardingCanAccessAttributes(
          entity.onboarding,
        ),
      }
    : undefined,
});

const getEntityStatus = (entity: Entity): EntityStatus => {
  if (entity.onboarding?.isAuthorized && entity.onboarding?.status) {
    return entity.onboarding.status as unknown as EntityStatus;
  }
  return EntityStatus.incomplete;
};

const getEntityManualReview = (entity: Entity) => {
  const userStatus = getEntityStatus(entity);
  const requiresManualReview = !!entity.onboarding?.requiresManualReview;
  return requiresManualReview && userStatus !== EntityStatus.incomplete;
};

const getEntityOnboardingCanAccessAttributes = (
  onboarding: Onboarding,
): DataIdentifier[] =>
  onboarding.canAccessData
    .map(collectDataOption => CdoToDiMap[collectDataOption])
    .flat();
