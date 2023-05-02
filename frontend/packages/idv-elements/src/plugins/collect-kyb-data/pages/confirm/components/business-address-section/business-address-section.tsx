import { Color } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24 } from '@onefootprint/icons';
import { BusinessDI } from '@onefootprint/types';
import React from 'react';

import { Section } from '../../../../../../components/confirm-collected-data';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';

type BusinessAddressSectionProps = {
  onEdit: () => void;
};

const createAddressLine = (address: Array<string | undefined | null>) =>
  address
    .map((value: string | undefined | null) => (value ? value.trim() : ''))
    .filter((value: string | undefined | null) => !!value)
    .join(', ');

const BusinessAddressSection = ({ onEdit }: BusinessAddressSectionProps) => {
  const { allT, t } = useTranslation('pages.confirm.business-address');
  const [state] = useCollectKybDataMachine();
  const { data } = state.context;

  const addressLine1 = data[BusinessDI.addressLine1];
  const addressLine2 = data[BusinessDI.addressLine2];
  const city = data[BusinessDI.city];
  const stateName = data[BusinessDI.state];
  const country = data[BusinessDI.country];
  const zip = data[BusinessDI.zip];

  if (
    !addressLine1 &&
    !addressLine2 &&
    !city &&
    !stateName &&
    !country &&
    !zip
  ) {
    return null;
  }

  const address = [
    {
      text: createAddressLine([addressLine1, addressLine2]),
      subtext: createAddressLine([city, stateName, zip, country]),
      textColor: 'primary' as Color,
    },
  ];

  return (
    <Section
      title={t('title')}
      editLabel={allT('pages.confirm.summary.edit')}
      onEdit={onEdit}
      IconComponent={IcoBuilding24}
      items={address}
    />
  );
};

export default BusinessAddressSection;
