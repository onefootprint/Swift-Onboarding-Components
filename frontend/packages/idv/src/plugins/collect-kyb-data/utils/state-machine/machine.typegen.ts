// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    delays: never;
    guards: never;
    services: never;
  };
  eventsCausingActions: {
    assignAuthToken: 'stepUpAuthTokenCompleted';
    assignData:
      | 'basicDataSubmitted'
      | 'beneficialOwnersSubmitted'
      | 'businessAddressSubmitted'
      | 'stepUpDecryptionCompleted';
    assignVaultData: 'businessDataLoadSuccess';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'basicData'
    | 'beneficialOwnerKyc'
    | 'beneficialOwners'
    | 'businessAddress'
    | 'completed'
    | 'confirm'
    | 'introduction'
    | 'loadFromVault'
    | 'router';
  tags: never;
}
