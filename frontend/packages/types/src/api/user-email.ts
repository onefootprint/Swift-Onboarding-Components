export type UserEmailObj = {
  email?: string;
};

export type UserEmailRequest = {
  data: UserEmailObj;
  speculative?: boolean;
  authToken: string;
  tenantPk: string;
};

export type UserEmailResponse = {};
