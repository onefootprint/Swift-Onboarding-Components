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
    assignConsent: 'consentReceived';
    assignContext: 'receivedContext';
    assignIdDocBackImage: 'receivedIdDocBackImage';
    assignIdDocCountryAndType: 'idDocCountryAndTypeSelected';
    assignIdDocFrontImage: 'receivedIdDocFrontImage';
    assignIdDocImageErrors: 'errored';
    assignSelfie: 'receivedSelfieImage';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'error'
    | 'failure'
    | 'idDocBackImage'
    | 'idDocCountryAndType'
    | 'idDocFrontImage'
    | 'init'
    | 'processingDocuments'
    | 'selfieImage'
    | 'selfiePrompt'
    | 'success';
  tags: never;
}
