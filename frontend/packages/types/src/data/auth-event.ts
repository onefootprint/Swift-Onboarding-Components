import type { InsightEvent } from './insight-event';

export enum IdentifyScope {
  my1fp = 'my1fp',
  onboarding = 'onboarding',
  auth = 'auth',
}

export type AuthEvent = {
  insight: InsightEvent;
  linkedAttestations: AuthEventAttestation[];
  kind: AuthEventKind;
  scope: IdentifyScope;
};

export enum AuthEventKind {
  sms = 'Sms',
  passkey = 'Passkey',
  email = 'Email',
  thirdParty = 'ThirdParty',
}

export type AuthEventAttestation = {
  appBundleId: string;
  model: string;
  os: string;
  fraudRisk: string;
  deviceType: AuthEventAttestationDeviceType;
};

export type AuthEventAttestationDeviceType = 'ios' | 'android';
