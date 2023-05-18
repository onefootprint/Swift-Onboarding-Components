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
    assignBasicData: 'basicDataSubmitted';
    assignBeneficialOwners: 'beneficialOwnersSubmitted';
    assignBusinessAddress: 'businessAddressSubmitted';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'basicData'
    | 'basicDataEditDesktop'
    | 'beneficialOwnerKyc'
    | 'beneficialOwners'
    | 'beneficialOwnersEditDesktop'
    | 'businessAddress'
    | 'businessAddressEditDesktop'
    | 'completed'
    | 'confirm'
    | 'init'
    | 'introduction';
  tags: never;
}
