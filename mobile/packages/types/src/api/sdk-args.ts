export type SendSdkArgsRequest = {
  data: Record<string, unknown>;
  kind: string;
};

export type SendSdkArgsResponse = {
  token: string;
  expiresAt: string;
};
