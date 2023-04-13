import CdoToDiMap from './cdo-to-di-map';
import { DataIdentifier, InvestorProfileDI } from './di';
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
  vaultOnly = 'vault_only',
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

export const hasEntityInvestorProfile = (entity: Entity) => {
  const values = Object.values(InvestorProfileDI);
  return values.some(investorProfileDi =>
    entity.attributes.some(attribute => attribute === investorProfileDi),
  );
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
  if (!entity.isPortable) {
    return EntityStatus.vaultOnly;
  }
  return (entity.onboarding?.status ||
    EntityStatus.incomplete) as unknown as EntityStatus;
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
