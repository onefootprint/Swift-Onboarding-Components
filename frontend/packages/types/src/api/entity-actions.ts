import type { DocumentRequestConfig, ReviewStatus } from '../data';

export type EntityActionsRequest = {
  entityId: string;
  actions: ActionRequest[];
};

export type ActionRequest =
  | { kind: ActionRequestKind.clearReview }
  | {
      kind: ActionRequestKind.manualDecision;
      annotation: {
        isPinned: boolean;
        note: string;
      };
      status: ReviewStatus;
    }
  | {
      kind: ActionRequestKind.trigger;
      note?: string;
      fpBid?: string;
      trigger: WorkflowRequestConfig;
    };

export enum ActionRequestKind {
  clearReview = 'clear_review',
  trigger = 'trigger',
  manualDecision = 'manual_decision',
}

export type WorkflowRequestConfig =
  | {
      kind: TriggerKind.Onboard;
      data: {
        playbookId: string;
      };
    }
  | {
      kind: TriggerKind.Document;
      data: {
        fpBid?: string;
        configs: DocumentRequestConfig[];
        businessConfigs: DocumentRequestConfig[];
      };
    };

export enum TriggerKind {
  Onboard = 'onboard',
  Document = 'document',
}

export type TriggerResponse = {
  kind: ActionRequestKind.trigger;
  token: string;
  link: string;
  expiresAt: string;
};

// Each action can technically return a response, but only one will
export type EntityActionsResponse = TriggerResponse[];
