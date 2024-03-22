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

export enum EntityLabel {
  active = 'active',
  offboard_fraud = 'offboard_fraud',
  offboard_other = 'offboard_other',
}

/// This type doesn't actually exist on the backend - it is a frontend-only representation of the
/// status of an entity.
/// Realistically, all but the `none` status exist on the backend as EntityStatuses
export enum EntityStatus {
  complete = 'complete',
  failed = 'fail',
  incomplete = 'incomplete',
  inProgress = 'in_progress',
  manualReview = 'manual_review',
  pass = 'pass',
  pending = 'pending',
  none = 'none', // Onboarding hasn't started for this vault
}

export type Transforms = {
  prefix_1?: string;
};

export type Attribute = {
  identifier: DataIdentifier;
  source: string;
  is_decryptable: boolean;
  value: VaultValue;
  transforms: Transforms;
};

export type Entity<TStatus = EntityStatus> = {
  data: Attribute[];
  hasOutstandingWorkflowRequest: boolean;
  id: string;
  isIdentifiable: boolean;
  kind: EntityKind;
  label: EntityLabel | null;
  lastActivityAt: string;
  requiresManualReview: boolean;
  sandboxId?: string;
  startTimestamp: string;
  status: TStatus;
  watchlistCheck: WatchlistCheckEventData | null;
  workflows: EntityWorkflow[];

  // TODO: deprecate these in favor of `data`
  attributes: DataIdentifier[];
  decryptableAttributes: DataIdentifier[];
  decryptedAttributes: EntityVault;
};

export enum WorkflowStatus {
  pass = 'pass',
  fail = 'fail',
  incomplete = 'incomplete',
  pending = 'pending',
}

export type EntityWorkflow = {
  createdAt: string;
  playbookId: string;
  insightEvent?: InsightEvent;
  status?: WorkflowStatus;
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

export const mostRecentWorkflow = (
  wf1: EntityWorkflow,
  wf2: EntityWorkflow,
) => {
  if (wf1.createdAt > wf2.createdAt) {
    return -1;
  }
  if (wf1.createdAt < wf2.createdAt) {
    return 1;
  }
  return 0;
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
