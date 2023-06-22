export type TriggerRequest = {
  entityId: string;
  trigger: Trigger;
  note?: string;
};

export type Trigger =
  | {
      kind: TriggerKind.RedoKyc;
    }
  | {
      kind: TriggerKind.IdDocument;
      data: {
        collectSelfie: boolean;
      };
    };

export enum TriggerKind {
  RedoKyc = 'redo_kyc',
  IdDocument = 'id_document',
}

export type TriggerResponse = {};
