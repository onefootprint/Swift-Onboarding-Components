import { IcoFileText16, IcoFileText216, IcoUsers16 } from '@onefootprint/icons';
import type { DataIdentifier, Entity } from '@onefootprint/types';
import { BusinessDI } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';

import type { Fieldset } from '../../../../vault.types';
import CorporationType from './components/corporation-type';

const useFieldsets = (): Fieldset => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.business.vault' });
  return {
    basic: {
      title: t('basic.title'),
      iconComponent: IcoFileText216,
      fields: [
        { di: BusinessDI.name },
        { di: BusinessDI.doingBusinessAs },
        {
          di: BusinessDI.tin,
        },
        {
          di: BusinessDI.corporationType,
          renderCustomField: ({
            di,
            entity,
          }: {
            di: DataIdentifier;
            entity: Entity;
          }) => <CorporationType di={di} entity={entity} />,
        },
        {
          di: BusinessDI.website,
        },
        {
          di: BusinessDI.phoneNumber,
        },
        {
          di: BusinessDI.formationState,
        },
        {
          di: BusinessDI.formationDate,
        },
      ],
    },
    address: {
      title: t('address.title'),
      iconComponent: IcoUsers16,
      fields: [
        { di: BusinessDI.country },
        { di: BusinessDI.addressLine1 },
        { di: BusinessDI.addressLine2 },
        { di: BusinessDI.city },
        { di: BusinessDI.zip },
        { di: BusinessDI.state },
      ],
    },
    custom: {
      title: t('custom.title'),
      iconComponent: IcoFileText16,
      fields: [],
    },
  };
};

export default useFieldsets;
