export type MachineContext = {
  type?: 'kyb' | 'kyc';
  name?: string;
};

export type MachineEvents =
  | {
      type: 'typeSubmitted';
      payload: {
        type: 'kyb' | 'kyc';
      };
    }
  | {
      type: 'etc';
    };
