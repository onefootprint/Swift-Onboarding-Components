import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24, IcoFileText224, IcoUsers24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';

import type { Fieldset } from '../../../../vault.types';

const useFieldsets = (): Fieldset => {
  const { t } = useTranslation('pages.user.vault');
  return {
    basic: {
      title: t('basic.title'),
      iconComponent: IcoFileText224,
      fields: [
        { di: IdDI.firstName },
        { di: IdDI.lastName },
        { di: IdDI.email },
        { di: IdDI.phoneNumber },
      ],
    },
    identity: {
      title: t('identity.title'),
      iconComponent: IcoUsers24,
      fields: [{ di: IdDI.ssn9 }, { di: IdDI.ssn4 }, { di: IdDI.dob }],
    },
    address: {
      title: t('address.title'),
      iconComponent: IcoBuilding24,
      fields: [
        { di: IdDI.country },
        { di: IdDI.addressLine1 },
        { di: IdDI.addressLine2 },
        { di: IdDI.city },
        { di: IdDI.zip },
        { di: IdDI.state },
      ],
    },
  };
};

export default useFieldsets;
