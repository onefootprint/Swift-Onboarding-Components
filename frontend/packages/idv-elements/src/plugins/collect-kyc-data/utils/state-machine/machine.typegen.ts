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
    assignInitialContext: 'receivedContext';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'addressEditDesktop'
    | 'basicInfoEditDesktop'
    | 'basicInformation'
    | 'completed'
    | 'confirm'
    | 'email'
    | 'emailEditDesktop'
    | 'identityEditDesktop'
    | 'init'
    | 'residentialAddress'
    | 'ssn';
  tags: never;
}
