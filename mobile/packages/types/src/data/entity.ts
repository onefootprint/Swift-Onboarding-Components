import type { DataIdentifier } from './di';
import { DocumentDI, InvestorProfileDI } from './di';
import type { Onboarding } from './onboarding';
import type { WatchlistCheckEventData } from './timeline';
import type { VaultValue } from './vault';

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
  isIdentifiable: boolean;
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
  return values.some(investorProfileDi => entity.attributes.some(attribute => attribute === investorProfileDi));
};

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
  if (!entity.isIdentifiable) {
    return EntityStatus.vaultOnly;
  }
  return (entity.onboarding?.status || EntityStatus.incomplete) as unknown as EntityStatus;
};

const getEntityManualReview = (entity: Entity) => {
  const userStatus = getEntityStatus(entity);
  const requiresManualReview = !!entity.onboarding?.requiresManualReview;
  return requiresManualReview && userStatus !== EntityStatus.incomplete;
};
