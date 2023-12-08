export type SubmitDocRequest = {
  authToken: string;
  extraCompress?: boolean;
  image: File;
  side: string;
  id: string;
  meta: {
    isUpload: boolean;
    manual?: boolean;
  };
};

export type SubmitDocResponse = {};
