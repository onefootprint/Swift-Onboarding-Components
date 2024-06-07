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
    assignOnboardingTemplate: 'onboardingTemplatesSelected';
    assignPlaybook: 'playbookSubmitted';
    assignResidency: 'residencySubmitted';
    assignVerificationChecks: 'verificationChecksSubmitted';
    assignWhoToOnboard: 'whoToOnboardSubmitted';
    resetKind: 'navigationBackward' | 'whoToOnboardSelected';
    resetOnboardingTemplate: 'navigationBackward' | 'templateSelected' | 'whoToOnboardSelected';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'nameYourPlaybook'
    | 'onboardingTemplates'
    | 'residency'
    | 'summary'
    | 'verificationChecks'
    | 'whoToOnboard';
  tags: never;
}
