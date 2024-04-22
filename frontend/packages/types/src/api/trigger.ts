import type { DocumentRequestConfig } from '../data';

export type TriggerRequest = {
  entityId: string;
  trigger: Trigger;
  note?: string;
  sendLink: boolean;
};

export type Trigger =
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
    };

export enum TriggerKind {
  RedoKyc = 'redo_kyc',
  Onboard = 'onboard',
  Document = 'document',
  IdDocument = 'id_document',
}

export type TriggerResponse = {
  token: string;
  link: string;
  expiresAt: string;
};
