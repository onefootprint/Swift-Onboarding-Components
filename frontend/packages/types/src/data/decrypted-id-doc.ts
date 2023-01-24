export type DecryptedIdDoc = {
  front: string;
  back?: string;
  selfie?: string;
  uploadedAt: string;
  status: 'success' | 'fail';
};
