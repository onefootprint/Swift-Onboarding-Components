import type { CustomDocumentUploadSettings } from '@onefootprint/types';

export type CustomDoc = {
  name: string;
  identifier: string;
  description?: string;
  uploadSettings: CustomDocumentUploadSettings;
};
