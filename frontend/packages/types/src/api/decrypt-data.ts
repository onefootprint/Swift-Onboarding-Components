export type DecryptDataRequest = {
  userId: string;
  fields: string[];
  reason: string;
};

export type DecryptDataResponse = Record<string, string | undefined>;
