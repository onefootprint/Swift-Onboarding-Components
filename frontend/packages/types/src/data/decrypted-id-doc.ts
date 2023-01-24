export enum DecryptedIdDocStatus {
  success = 'success',
  fail = 'fail',
}

export type DecryptedIdDoc = {
  front: string;
  back?: string;
  selfie?: string;
  uploadedAt: string;
  status: DecryptedIdDocStatus;
};
