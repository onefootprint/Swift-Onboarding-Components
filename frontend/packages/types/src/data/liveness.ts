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
  device?: string;
  os?: string;
};
