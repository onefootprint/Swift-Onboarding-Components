export enum UploadDocumentSide {
  Front = 'front',
  Back = 'back',
  Selfie = 'selfie',
}

export type UploadDocRequest = {
  authToken: string;
  data: FormData;
  docId: string;
  meta: Record<string, any>;
  side?: UploadDocumentSide;
};

export type UploadDocResponse = {};
