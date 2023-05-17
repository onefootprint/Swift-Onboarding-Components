import { Color } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import React from 'react';

import { Section } from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { getDisplayValue } from '../../../../utils/data-types';
import createAddressLine from './utils/create-address-line';

type AddressSectionProps = {
  onEdit: () => void;
};

const AddressSection = ({ onEdit }: AddressSectionProps) => {
  const { t, allT } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;

  const address = [];
  const addressLine1 = getDisplayValue(data[IdDI.addressLine1]);
  const addressLine2 = getDisplayValue(data[IdDI.addressLine2]);
  const city = getDisplayValue(data[IdDI.city]);
  const stateName = getDisplayValue(data[IdDI.state]);
  const country = getDisplayValue(data[IdDI.country]);
  const zip = getDisplayValue(data[IdDI.zip]);
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
      editLabel={allT('pages.confirm.summary.edit')}
      onEdit={handleEdit}
      IconComponent={IcoBuilding24}
      items={address}
    />
  );
};

export default AddressSection;
