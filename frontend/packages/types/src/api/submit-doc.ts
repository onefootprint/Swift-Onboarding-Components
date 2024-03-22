export type SubmitDocRequest = {
  authToken: string;
  extraCompress?: boolean;
  image: File | Blob;
  side: string;
  id: string;
  forceUpload?: boolean;
  meta: {
    isUpload: boolean;
    manual?: boolean;
  };
};

export type SubmitDocResponse = {};
