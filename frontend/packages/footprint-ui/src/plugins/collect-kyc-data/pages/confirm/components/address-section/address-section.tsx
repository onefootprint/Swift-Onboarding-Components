import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24 } from '@onefootprint/icons';
import { Color } from '@onefootprint/themes';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';

import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import Section from '../section';
import createAddressLine from './utils/create-address-line';

type AddressSectionProps = {
  onEdit: () => void;
};

const AddressSection = ({ onEdit }: AddressSectionProps) => {
  const { t } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;

  const address = [];
  const addressLine1 = data[UserDataAttribute.addressLine1];
  const addressLine2 = data[UserDataAttribute.addressLine2];
  const city = data[UserDataAttribute.city];
  const stateName = data[UserDataAttribute.state];
  const country = data[UserDataAttribute.country];
  const zip = data[UserDataAttribute.zip];
  const hasFullAddress = addressLine1 && city && stateName && country && zip;
  const hasCountryAndZip = country && zip;
  if (hasFullAddress) {
    address.push({
      text: createAddressLine([addressLine1, addressLine2]),
      subtext: createAddressLine([city, stateName, zip, country]),
      textColor: 'primary' as Color,
    });
  } else if (hasCountryAndZip) {
    address.push({
      text: createAddressLine([zip, country]),
      textColor: 'primary' as Color,
    });
  } else {
    return null;
  }

  const handleEdit = () => {
    onEdit();
  };

  return (
    <Section
      title={t('address.title')}
      onEdit={handleEdit}
      IconComponent={IcoBuilding24}
      items={address}
    />
  );
};

export default AddressSection;
