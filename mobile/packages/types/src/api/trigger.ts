export type TriggerRequest = {
  entityId: string;
  kind: TriggerKind;
  note?: string;
};

export enum TriggerKind {
  RedoKyc = 'redo_kyc',
  IdDocument = 'id_document',
}

export type TriggerResponse = {};
