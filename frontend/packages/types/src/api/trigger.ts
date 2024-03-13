export type TriggerRequest = {
  entityId: string;
  trigger: Trigger;
  note?: string;
  sendLink: boolean;
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
    }
  | {
      kind: TriggerKind.ProofOfSsn;
    }
  | {
      kind: TriggerKind.ProofOfAddress;
    };

export enum TriggerKind {
  RedoKyc = 'redo_kyc',
  Onboard = 'onboard',
  IdDocument = 'id_document',
  ProofOfSsn = 'proof_of_ssn',
  ProofOfAddress = 'proof_of_address',
}

export type TriggerResponse = {
  token: string;
  link: string;
  expiresAt: string;
};
