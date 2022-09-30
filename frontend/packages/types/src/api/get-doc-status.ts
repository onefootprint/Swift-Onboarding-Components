export type GetDocStatusRequest = {
  authToken: string;
  id: string;
};

export type GetDocStatusResponse = {
  status: 'pending' | 'complete';
};
