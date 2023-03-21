export type UploadFileRequest = {
  authToken: string;
  file: File;
};

export type UploadFileResponse = {
  data: string;
};
