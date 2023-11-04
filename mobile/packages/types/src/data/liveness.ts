import type { InsightEvent } from './insight-event';

export type Liveness = {
  source: LivenessSource;
  attributes: LivenessAttribute | null;
  insightEvent: InsightEvent;
};

export enum LivenessSource {
  skipped = 'skipped',
  webauthnAttestation = 'webauthn_attestation',
  privacyPass = 'privacyPass',
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
