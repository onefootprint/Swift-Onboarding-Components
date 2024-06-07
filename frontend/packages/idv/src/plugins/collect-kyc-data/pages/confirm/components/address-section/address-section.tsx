import type { Color } from '@onefootprint/design-tokens';
import { IcoBuilding24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SectionAction, SectionItemProps } from '../../../../../../components/confirm-collected-data';
import { Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import Address from '../../../residential-address';
import createAddressLine from './utils/create-address-line';

const AddressSection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages' });
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;

  const address = [];
  const addressLine1 = data[IdDI.addressLine1]?.value;
  const addressLine2 = data[IdDI.addressLine2]?.value;
  const city = data[IdDI.city]?.value;
  const stateName = data[IdDI.state]?.value;
  const country = data[IdDI.country]?.value;
  const zip = data[IdDI.zip]?.value;
  const [editing, setEditing] = useState(false);

  if (!addressLine1 && !addressLine2 && !city && !stateName && !country && !zip) {
    return null;
  }

  address.push({
    text: createAddressLine([addressLine1, addressLine2]),
    subtext: createAddressLine([city, stateName, zip, country]),
    textColor: 'primary' as Color,
  });

  const addressItem = address.map(({ text, subtext, textColor }: SectionItemProps) => (
    <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
  ));

  const stopEditing = () => {
    setEditing(false);
  };

  const getSectionContent = () => {
    if (!editing) {
      return addressItem;
    }
    return <Address onCancel={stopEditing} onComplete={stopEditing} hideHeader disableCountry />;
  };

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: t('confirm.summary.edit'),
      onClick: () => setEditing(true),
    });
  }

  return (
    <Section
      title={t('confirm.address.title')}
      actions={actions}
      IconComponent={IcoBuilding24}
      content={getSectionContent()}
      testID="address-section"
    />
  );
};

export default AddressSection;
