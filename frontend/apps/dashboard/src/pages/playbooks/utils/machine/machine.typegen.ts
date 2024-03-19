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
    assignNameYourPlaybook: 'nameYourPlaybookSubmitted';
    assignPlaybook: 'playbookSubmitted';
    assignResidency: 'residencySubmitted';
    assignVerificationChecks: 'verificationChecksSubmitted';
    assignWhoToOnboard: 'whoToOnboardSubmitted';
    resetKind: 'navigationBackward' | 'whoToOnboardSelected';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'nameYourPlaybook'
    | 'residency'
    | 'summary'
    | 'verificationChecks'
    | 'whoToOnboard';
  tags: never;
}
