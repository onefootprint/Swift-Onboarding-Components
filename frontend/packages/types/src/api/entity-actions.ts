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
        configs: DocumentRequestConfig[];
      };
    }
  | {
      kind: TriggerKind.RedoKyc;
    };

export enum TriggerKind {
  RedoKyc = 'redo_kyc',
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
