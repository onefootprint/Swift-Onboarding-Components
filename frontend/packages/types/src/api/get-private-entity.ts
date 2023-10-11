export type GetPrivateEntityRequest = {
  id: string;
};

export type GetPrivateEntityResponse = {
  id: string;
  isLive: boolean;
  tenantId: string;
};
