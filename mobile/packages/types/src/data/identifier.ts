export type Identifier =
  | {
      email: string;
      phoneNumber?: never;
    }
  | {
      phoneNumber: string;
      email?: never;
    }
  | { authToken: string };
