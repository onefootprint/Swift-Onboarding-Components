// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  internalEvents: {
    '': { type: '' };
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
    assignCountryAndType: 'countryAndTypeSubmitted';
    assignDefaultCountryAndType: '';
    assignNextSideToCollect: 'imageSubmitted';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'backImage'
    | 'completed'
    | 'docSelection'
    | 'frontImage'
    | 'init'
    | 'selfie';
  tags: never;
}
