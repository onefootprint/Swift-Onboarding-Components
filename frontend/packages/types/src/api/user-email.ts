export type UserEmailObj = {
  email?: string;
};

export type UserEmailRequest = {
  data: UserEmailObj;
  authToken: string;
  speculative?: boolean;
};

export type UserEmailResponse = {};
