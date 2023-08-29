export type GetDeviceAttestationChallengeRequest = {
  deviceType: 'ios' | 'android';
};

export type GetDeviceAttestationChallengeResponse = {
  attestationChallenge: string;
  state: string;
};

export type CreateDeviceAttestationRequest = {
  attestation: string;
  state: string;
};
