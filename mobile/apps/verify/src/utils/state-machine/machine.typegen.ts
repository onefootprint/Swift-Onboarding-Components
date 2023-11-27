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
    assignConfig: 'sdkArgsReceived';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'basicInformation'
    | 'completed'
    | 'emailIdentification'
    | 'init'
    | 'initFailed'
    | 'phoneIdentification'
    | 'residentialAddress'
    | 'smsChallenge'
    | 'ssn';
  tags: never;
}
