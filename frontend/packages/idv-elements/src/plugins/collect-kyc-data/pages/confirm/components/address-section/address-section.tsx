import { Color } from '@onefootprint/design-tokens';
import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import React, { useState } from 'react';

import {
  type SectionItemProps,
  Section,
  SectionAction,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { getDisplayValue } from '../../../../utils/data-types';
import Address from '../../../residential-address';
import createAddressLine from './utils/create-address-line';

const AddressSection = () => {
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
  const [editing, setEditing] = useState(false);

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

  const addressItem = address.map(
    ({ text, subtext, textColor }: SectionItemProps) => (
      <SectionItem
        key={text}
        text={text}
        subtext={subtext}
        textColor={textColor}
      />
    ),
  );

  const stopEditing = () => {
    setEditing(false);
  };

  const getSectionContent = () => {
    if (!editing) {
      return addressItem;
    }
    return (
      <Address onCancel={stopEditing} onComplete={stopEditing} hideHeader />
    );
  };

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: allT('pages.confirm.summary.edit'),
      onClick: () => setEditing(true),
    });
  }

  return (
    <Section
      title={t('address.title')}
      actions={actions}
      IconComponent={IcoBuilding24}
      content={getSectionContent()}
      testID="address-section"
    />
  );
};

export default AddressSection;
