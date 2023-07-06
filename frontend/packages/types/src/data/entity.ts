import { DataIdentifier, DocumentDI, InvestorProfileDI } from './di';
import { EntityCard } from './entity-cards';
import { Onboarding } from './onboarding';
import { WatchlistCheckEventData } from './timeline';
import { VaultValue } from './vault';

export type EntityVault = Partial<Record<DataIdentifier, VaultValue>> & {
  cards?: EntityCard[];
};

export enum EntityKind {
  business = 'business',
  person = 'person',
}

/// This type doesn't actually exist on the backend - it is a frontend-only representation of the
/// status of an entity.
/// Realistically, all but the `none` status exist on the backend as OnboardingStatuses
export enum EntityStatus {
  failed = 'fail',
  incomplete = 'incomplete',
  pending = 'pending',
  pass = 'pass',
  none = 'none', // Onboarding hasn't started for this vault
}

export type Entity = {
  attributes: DataIdentifier[];
  decryptableAttributes: DataIdentifier[];
  id: string;
  isPortable: boolean;
  kind: EntityKind;
  onboarding?: Onboarding;
  requiresManualReview: boolean;
  startTimestamp: string;
  status: EntityStatus;
  decryptedAttributes: EntityVault;
  watchlistCheck: WatchlistCheckEventData | null;
};

export const hasEntityInvestorProfile = (entity: Entity) => {
  const values = Object.values(InvestorProfileDI);
  return values.some(investorProfileDi =>
    entity.attributes.some(attribute => attribute === investorProfileDi),
  );
};

export const hasEntityCards = (entity: Entity) =>
  entity.attributes.some(attr => attr.startsWith('card'));

export const hasEntityCustomData = (entity: Entity) =>
  entity.attributes.some(attr => attr.startsWith('custom'));

export const hasEntityDocuments = (entity: Entity) => {
  const values = Object.values(DocumentDI);
  return values.some(documentDI =>
    entity.attributes.some(
      attribute =>
        attribute === documentDI &&
        // this is a little bit hacky for now, but finra compliance belongs to the investor profile CDO in theory
        // however in the backend, is part of the documentCDO
        documentDI !== DocumentDI.finraComplianceLetter,
    ),
  );
};

export const augmentEntityWithOnboardingInfo = (entity: Entity) => ({
  ...entity,
  requiresManualReview: getEntityManualReview(entity),
  status: getEntityStatus(entity),
});

const getEntityStatus = (entity: Entity): EntityStatus => {
  if (!entity.onboarding) {
    return EntityStatus.none;
  }
  return (entity.onboarding.status ||
    EntityStatus.incomplete) as unknown as EntityStatus;
};

const getEntityManualReview = (entity: Entity) => {
  const userStatus = getEntityStatus(entity);
  const requiresManualReview = !!entity.onboarding?.requiresManualReview;
  return requiresManualReview && userStatus !== EntityStatus.incomplete;
};
