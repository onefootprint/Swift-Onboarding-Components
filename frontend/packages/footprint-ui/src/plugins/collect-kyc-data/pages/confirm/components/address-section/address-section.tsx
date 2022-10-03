import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React, { useState } from 'react';

import { useCollectKycDataMachine } from '../../../../components/machine-provider';
import EditSheet from '../edit-sheet';
import Section from '../section';
import createAddressLine from './utils/create-address-line';

const AddressSection = () => {
  const { t } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const [edit, setEdit] = useState(false);

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
      textColor: 'primary',
    });
  } else if (hasCountryAndZip) {
    address.push({
      text: createAddressLine([zip, country]),
      textColor: 'primary',
    });
  } else {
    return null;
  }

  const handleEdit = () => {
    setEdit(true);
  };
  const handleCloseEdit = () => {
    setEdit(false);
  };
  const handleSaveEdit = () => {
    // TODO: implement calling sync data speculatively here
    setEdit(false);
  };

  return (
    <>
      <Section
        title={t('address.title')}
        onEdit={handleEdit}
        IconComponent={IcoBuilding24}
        items={address}
      />
      <EditSheet
        open={!!edit}
        onClose={handleCloseEdit}
        name={t('address.title')}
        onSave={handleSaveEdit}
      >
        {/* TODO: implement editing content */}
      </EditSheet>
    </>
  );
};

export default AddressSection;
