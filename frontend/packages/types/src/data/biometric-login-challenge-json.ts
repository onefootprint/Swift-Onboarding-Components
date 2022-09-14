export type BiometricLoginChallengeJson = {
  userVaultId: string;
  credentialId: string;
  publicKey: PublicKeyCredentialRequestOptions;
  attestationData: string[];
};
