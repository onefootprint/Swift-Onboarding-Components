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
    assignData: 'dataSubmitted';
    assignInitialData: 'initialized';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'basicInformation'
    | 'completed'
    | 'confirm'
    | 'email'
    | 'init'
    | 'residentialAddress'
    | 'router'
    | 'ssn';
  tags: never;
}
