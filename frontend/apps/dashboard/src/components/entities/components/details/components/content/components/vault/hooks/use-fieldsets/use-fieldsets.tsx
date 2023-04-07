import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24, IcoFileText224, IcoUsers24 } from '@onefootprint/icons';
import { BusinessDI } from '@onefootprint/types';

import type { Fieldset } from '../../vault.types';
import BusinessOwners from './components/business-owners';

const useFieldsets = (): Fieldset => {
  const { t } = useTranslation('pages.entity.vault');
  return {
    basic: {
      title: t('basic.title'),
      iconComponent: IcoFileText224,
      fields: [
        { di: BusinessDI.name },
        {
          di: BusinessDI.tin,
        },
      ],
    },
    bos: {
      title: t('bos.title'),
      iconComponent: IcoBuilding24,
      fields: [
        {
          di: BusinessDI.beneficialOwners,
          renderCustomField: BusinessOwners,
        },
      ],
    },
    address: {
      title: t('address.title'),
      iconComponent: IcoUsers24,
      fields: [
        { di: BusinessDI.country },
        { di: BusinessDI.addressLine1 },
        { di: BusinessDI.addressLine2 },
        { di: BusinessDI.city },
        { di: BusinessDI.zip },
        { di: BusinessDI.state },
      ],
    },
  };
};

export default useFieldsets;
