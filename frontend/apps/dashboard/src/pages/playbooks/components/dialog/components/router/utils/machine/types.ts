export enum Kind {
  KYB = 'kyb',
  KYC = 'kyc',
}

export type MachineContext = {
  kind?: Kind;
  name?: string;
};

export type MachineEvents =
  | {
      type: 'whoToOnboardSubmitted';
      payload: {
        kind: Kind;
      };
    }
  | {
      type: 'whoToOnboardSelected';
    };
