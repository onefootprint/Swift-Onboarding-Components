import type { DocumentRequestConfig } from '../data';

export type TriggerRequest = {
  entityId: string;
  trigger: WorkflowRequestConfig;
  note?: string;
  sendLink: boolean;
};

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
  token: string;
  link: string;
  expiresAt: string;
};
