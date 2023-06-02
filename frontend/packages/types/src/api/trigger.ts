export type TriggerRequest = {
  entityId: string;
  kind: TriggerKind;
  note?: string;
};

export enum TriggerKind {
  RedoKyc = 'redo_kyc',
  ReuploadDl = 'reupload_dl',
}

export type TriggerResponse = {};
