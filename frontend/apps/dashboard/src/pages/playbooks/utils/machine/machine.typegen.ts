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
    assignAml: 'amlSubmitted';
    assignNameYourPlaybook: 'nameYourPlaybookSubmitted';
    assignPlaybook: 'playbookSubmitted';
    assignResidency: 'residencySubmitted';
    assignWhoToOnboard: 'whoToOnboardSubmitted';
    resetKind: 'navigationBackward' | 'whoToOnboardSelected';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'aml'
    | 'nameYourPlaybook'
    | 'residency'
    | 'summary'
    | 'whoToOnboard';
  tags: never;
}
