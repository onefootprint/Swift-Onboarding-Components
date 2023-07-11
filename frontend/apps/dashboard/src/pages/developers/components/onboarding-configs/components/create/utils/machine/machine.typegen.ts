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
    assignKybAccess: 'kybAccessSubmitted';
    assignKybCollect: 'kybCollectSubmitted';
    assignKycAccess: 'kycAccessSubmitted';
    assignKycCollect: 'kycCollectSubmitted';
    assignKycInvestorProfile: 'kycInvestorProfileSubmitted';
    assignName: 'nameSubmitted';
    assignType: 'typeSubmitted';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'complete'
    | 'kybAccess'
    | 'kybBoCollect'
    | 'kybCollect'
    | 'kycAccess'
    | 'kycCollect'
    | 'kycInvestorProfile'
    | 'name'
    | 'type';
  tags: never;
}
