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
    assignKind: 'kindSubmitted';
    assignNameYourPlaybook: 'nameYourPlaybookSubmitted';
    assignOnboardingTemplate: 'onboardingTemplatesSelected';
    assignPlaybook: 'playbookSubmitted';
    assignResidency: 'residencySubmitted';
    assignVerificationChecks: 'verificationChecksSubmitted';
    resetKind: 'kindSelected' | 'navigationBackward';
    resetOnboardingTemplate: 'kindSelected' | 'navigationBackward' | 'templateSelected';
  };
  eventsCausingDelays: {};
  eventsCausingGuards: {};
  eventsCausingServices: {};
  matchesStates:
    | 'kind'
    | 'nameYourPlaybook'
    | 'onboardingTemplates'
    | 'residency'
    | 'settingsAuth'
    | 'settingsDocOnly'
    | 'settingsKyb'
    | 'settingsKyb.settingsBo'
    | 'settingsKyb.settingsBusiness'
    | 'settingsKyb.otpVerifications'
    | 'settingsKyc.personalInfo'
    | 'settingsKyc.otpVerifications'
    | { settingsKyc?: 'personalInfo' | 'otpVerifications' }
    | 'verificationChecks'
    | { settingsKyb?: 'settingsBo' | 'settingsBusiness' | 'otpVerifications' };
  tags: never;
}
