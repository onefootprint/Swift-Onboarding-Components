import CdoToAllDisMap from './cdo-to-di-map';
import { CollectedKycDataOption } from './collected-data-option';
import type { DataIdentifier } from './di';
import { DocumentDI, InvestorProfileDI } from './di';
import type { EntityCard } from './entity-cards';
import type { InsightEvent } from './insight-event';
import type { WatchlistCheckEventData } from './timeline';
import type { VaultValue } from './vault';

export type EntityVault = Partial<Record<DataIdentifier, VaultValue>> & {
  cards?: EntityCard[];
};

export enum EntityKind {
  business = 'business',
  person = 'person',
}

export enum ApiEntityStatus {
  pass = 'pass',
  fail = 'fail',
  pending = 'pending',
  incomplete = 'incomplete',
  inProgress = 'in_progress',
}

/// This type doesn't actually exist on the backend - it is a frontend-only representation of the
/// status of an entity.
/// Realistically, all but the `none` status exist on the backend as EntityStatuses
export enum EntityStatus {
  failed = 'fail',
  incomplete = 'incomplete',
  inProgress = 'in_progress',
  pending = 'pending',
  pass = 'pass',
  none = 'none', // Onboarding hasn't started for this vault
}

export type Entity<TStatus = EntityStatus> = {
  attributes: DataIdentifier[];
  decryptableAttributes: DataIdentifier[];
  id: string;
  isPortable: boolean;
  kind: EntityKind;
  startTimestamp: string;
  decryptedAttributes: EntityVault;
  watchlistCheck: WatchlistCheckEventData | null;
  status: TStatus;
  requiresManualReview: boolean;
  insightEvent?: InsightEvent;
};

export const hasEntityUsLegalStatus = (entity: Entity) =>
  entity.attributes.some(attr =>
    CdoToAllDisMap[CollectedKycDataOption.usLegalStatus].includes(attr),
  );

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

export const augmentEntityWithOnboardingInfo = (
  entity: Entity<ApiEntityStatus | undefined>,
) => ({
  ...entity,
  status: getEntityStatus(entity),
});

const getEntityStatus = (
  entity: Entity<ApiEntityStatus | undefined>,
): EntityStatus =>
  entity.status
    ? (entity.status as unknown as EntityStatus)
    : EntityStatus.none;
