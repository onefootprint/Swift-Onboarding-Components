export type BiometricRegisterChallengeJson = {
  userVaultId: string;
  credentialId: string;
  publicKey: PublicKeyCredentialCreationOptions;
  attestationData: string[];
};
