import type { Actor } from './actor';
import type { CollectedDataOption } from './collected-data-option';
import type DecisionStatus from './decision-status';
import type Vendor from './vendor';

export type OnboardingDecision = {
  id: string;
  status: DecisionStatus;
  timestamp: Date;
  source: Actor;
  obConfiguration: TimelinePlaybook;
  workflowKind: WorkflowKind;
  vendors: Vendor[];
  ruleSetResultId?: string;
  // We don't yet care about the contents of the MRs, just the count
  clearedManualReviews?: object[];
  /** When true, the rules were ran for this decision despite being in sandbox mode - we should show the rules outcome drawer */
  ranRulesInSandbox: boolean;
};

export type TimelinePlaybook = {
  id: string;
  playbookId: string;
  name: string;
  mustCollectData: CollectedDataOption[];
};

export enum WorkflowKind {
  Document = 'document',
  Kyc = 'kyc',
  Kyb = 'kyb',
  AlpacaKyc = 'alpaca_kyc',
}
