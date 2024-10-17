import type { CustomDoc } from '../../../custom-docs-form';

export type BusinessFormData = {
  data: {
    address: boolean;
    collectBOInfo: boolean;
    name: boolean;
    phoneNumber: boolean;
    tin: boolean;
    type: boolean;
    website: boolean;
  };
  docs: {
    custom: CustomDoc[];
  };
};
