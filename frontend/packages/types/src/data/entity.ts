import CdoToAllDisMap from './cdo-to-di-map';
import { CollectedKycDataOption } from './collected-data-option';
import type { DataIdentifier } from './di';
import { DocumentDI, IdDI, InvestorProfileDI } from './di';
import type { EntityBankAccount } from './entity-bank-account';
import type { EntityCard } from './entity-cards';
import type { InsightEvent } from './insight-event';
import type { Tag } from './tag';
import type { WatchlistCheckEventData } from './timeline';
import type { DataKind, VaultValue } from './vault';

export type EntityVault = Partial<Record<DataIdentifier, VaultValue>> & {
  cards?: EntityCard[];
  bankAccounts?: EntityBankAccount[];
};

export enum EntityKind {
  business = 'business',
  person = 'person',
}

export enum EntityLabel {
  active = 'active',
  offboard_fraud = 'offboard_fraud',
  offboard_other = 'offboard_other',
}

export enum EntityStatus {
  pass = 'pass',
  failed = 'fail',
  incomplete = 'incomplete',
  inProgress = 'in_progress',
  pending = 'pending',
  none = 'none',
}

export type Transforms = {
  prefix_1?: string;
};

export type Attribute = {
  identifier: DataIdentifier;
  source: string;
  isDecryptable: boolean;
  dataKind: DataKind;
  value: VaultValue;
  transforms: Transforms;
};

export type Entity = {
  svId?: string;
  vId?: string;
  data: Attribute[];
  tags?: Tag[];
  hasOutstandingWorkflowRequest: boolean;
  id: string;
  isIdentifiable: boolean;
  kind: EntityKind;
  label: EntityLabel | null;
  lastActivityAt: string;
  requiresManualReview: boolean;
  sandboxId?: string;
  externalId?: string;
  startTimestamp: string;
  status: EntityStatus;
  watchlistCheck: WatchlistCheckEventData | null;
  workflows: EntityWorkflow[];
};

export enum WorkflowStatus {
  pass = 'pass',
  fail = 'fail',
  incomplete = 'incomplete',
  pending = 'pending',
  none = 'none',
}

export type EntityWorkflow = {
  createdAt: string;
  playbookId: string;
  insightEvent?: InsightEvent;
  status?: WorkflowStatus;
};

export const hasEntityUsLegalStatus = (entity: Entity) =>
  entity.data.some(attr => CdoToAllDisMap[CollectedKycDataOption.usLegalStatus].includes(attr.identifier));

export const hasEntityNationality = (entity: Entity) => entity.data.some(attr => attr.identifier === IdDI.nationality);

export const hasEntityInvestorProfile = (entity: Entity) => {
  const values = Object.values(InvestorProfileDI);
  return values.some(investorProfileDi => entity.data.some(attribute => attribute.identifier === investorProfileDi));
};

export const hasEntityBankAccounts = (entity: Entity) => entity.data.some(attr => attr.identifier.startsWith('bank'));

export const hasEntityCards = (entity: Entity) => entity.data.some(attr => attr.identifier.startsWith('card'));

export const hasEntityCustomData = (entity: Entity) =>
  entity.data.some(attr => attr.identifier.startsWith('custom') || attr.identifier.startsWith('document.custom'));

export const hasEntityDocuments = (entity: Entity) => {
  const values = Object.values(DocumentDI);
  return values.some(documentDI =>
    entity.data.some(
      attribute =>
        attribute.identifier === documentDI &&
        // this is a little bit hacky for now, but finra compliance belongs to the investor profile CDO in theory
        // however in the backend, is part of the documentCDO
        documentDI !== DocumentDI.finraComplianceLetter,
    ),
  );
};

export const mostRecentWorkflow = (wf1: EntityWorkflow, wf2: EntityWorkflow) => {
  if (wf1.createdAt > wf2.createdAt) {
    return -1;
  }
  if (wf1.createdAt < wf2.createdAt) {
    return 1;
  }
  return 0;
};
