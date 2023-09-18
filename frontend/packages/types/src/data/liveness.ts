import type { InsightEvent } from './insight-event';

export type Liveness = {
  source: LivenessSource;
  attributes: LivenessAttribute | null;
  insight: InsightEvent;
  kind: LivenessKind;
  linkedAttestations: LivenessAttestation[];
};

export enum LivenessKind {
  sms = 'Sms',
  passkey = 'Passkey',
}

export type LivenessAttestation = {
  appBundleId: string;
  model: string;
  os: string;
  fraudRisk: string;
  deviceType: LivenessAttestationDeviceType;
};

export type LivenessAttestationDeviceType = 'ios' | 'android';

export enum LivenessSource {
  skipped = 'skipped',
  webauthnAttestation = 'webauthn_attestation',
  privacyPass = 'privacyPass',
  appleDeviceAttestation = 'apple_device_attestation',
}

export enum LivenessIssuer {
  apple = 'apple',
  google = 'google',
  cloudflare = 'cloudflare',
  footprint = 'footprint',
}

export type LivenessAttribute = {
  issuers: LivenessIssuer[];
  device: string | null;
  os: string | null;
  metadata: LivenessMetadata;
};
export type LivenessMetadata = InstantAppMetadata | null;

export type InstantAppMetadata = {
  androidSafetyNet: {
    basicIntegrity: boolean;
    evaluationType: string;
    apkPackageName: string;
    ctsProfileMatch: boolean;
    apkCertificateDigestSha256: string[];
  };
};
