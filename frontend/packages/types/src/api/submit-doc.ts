export type SubmitDocRequest = {
  authToken: string;
  image: File;
  side: string;
  id: string;
  meta: {
    manual?: boolean;
  };
};

export type SubmitDocResponse = {};
