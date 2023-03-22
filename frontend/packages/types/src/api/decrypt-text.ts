export type DecryptTextRequest = {
  userId: string;
  fields: string[];
  reason: string;
};

export type DecryptTextResponse = Record<string, string | undefined>;
