export enum UserChallengeActionKind {
  replace = 'replace',
  addPrimary = 'add_primary',
}

export type BiometricRegisterRequest = {
  actionKind: UserChallengeActionKind;
  authToken: string;
};

export type BiometricRegisterResponse = {
  data: string;
};
