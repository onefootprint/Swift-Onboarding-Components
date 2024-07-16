import type { Color } from '@onefootprint/design-tokens';
import { IcoBuilding24 } from '@onefootprint/icons';
import type { CollectKycDataRequirement, PublicOnboardingConfig } from '@onefootprint/types';
import { IdDI } from '@onefootprint/types';
import React, { useState } from 'react';

import type { SectionAction, SectionItemProps } from '@/components/confirm-collected-data';
import { Section, SectionItem } from '@/components/confirm-collected-data';
import useTranslation from '@/hooks/use-translation';
import ResidentialAddress from '@/screens/residential-address';
import type { KycData } from '@/types';

import createAddressLine from './utils/create-address-line';

type BasicInfoSectionProps = {
  authToken: string;
  requirement: CollectKycDataRequirement;
  data: KycData;
  config: PublicOnboardingConfig;
  onConfirm: (data: KycData) => void;
};

const AddressSection = ({ data, onConfirm, requirement, authToken, config }: BasicInfoSectionProps) => {
  const { t, allT } = useTranslation('pages.confirm');

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

  const handleComplete = (kycData: KycData) => {
    onConfirm(kycData);
    setEditing(false);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  const getSectionContent = () => {
    if (!editing) {
      return addressItem;
    }
    return (
      <ResidentialAddress
        authToken={authToken}
        requirement={requirement}
        kycData={data}
        config={config}
        onCancel={stopEditing}
        onComplete={handleComplete}
        hideHeader
      />
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
