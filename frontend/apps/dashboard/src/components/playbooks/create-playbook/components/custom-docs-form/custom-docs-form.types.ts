import type { DocumentUploadSettings } from '@onefootprint/request-types/dashboard';

export type CustomDoc = {
  name: string;
  identifier: string;
  description?: string;
  uploadSettings: DocumentUploadSettings;
};
