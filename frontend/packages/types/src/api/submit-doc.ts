export type SubmitDocRequest = {
  authToken: string;
  extraCompress?: boolean;
  image: File;
  side: string;
  id: string;
  meta: {
    manual?: boolean;
  };
};

export type SubmitDocResponse = {};
