import type { CustomDoc } from '../collect-custom-docs-form';

export type AdditionalDocsFormData = {
  docs: {
    custom: CustomDoc[];
    poa: boolean;
    possn: boolean;
    requireManualReview: boolean;
  };
};

export type { CustomDoc };
