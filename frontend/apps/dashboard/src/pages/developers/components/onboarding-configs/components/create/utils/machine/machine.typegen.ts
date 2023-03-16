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
    assignKycCollect: 'kycCollectSubmitted';
    assignName: 'nameSubmitted';
    assignType: 'typeSubmitted';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'kybAccess'
    | 'kybCollect'
    | 'kycAccess'
    | 'kycCollect'
    | 'name'
    | 'type';
  tags: never;
}
