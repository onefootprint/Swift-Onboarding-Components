import type { Color } from '@onefootprint/design-tokens';
import { IcoBuilding24 } from '@onefootprint/icons';
import { BusinessDI } from '@onefootprint/types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SectionAction, SectionItemProps } from '../../../../../../components/confirm-collected-data';
import { Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import useCollectKybDataMachine from '../../../../hooks/use-collect-kyb-data-machine';
import BusinessAddress from '../../../business-address/business-address';

const createAddressLine = (address: Array<string | undefined | null>) =>
  address
    .map((value: string | undefined | null) => (value ? value.trim() : ''))
    .filter((value: string | undefined | null) => !!value)
    .join(', ');

const BusinessAddressSection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages' });
  const [state] = useCollectKybDataMachine();
  const { data } = state.context;

  const addressLine1 = data[BusinessDI.addressLine1];
  const addressLine2 = data[BusinessDI.addressLine2];
  const city = data[BusinessDI.city];
  const stateName = data[BusinessDI.state];
  const country = data[BusinessDI.country];
  const zip = data[BusinessDI.zip];

  const [editing, setEditing] = useState(false);

  if (!addressLine1 && !addressLine2 && !city && !stateName && !country && !zip) {
    return null;
  }

  const address = [
    {
      text: createAddressLine([addressLine1, addressLine2]),
      subtext: createAddressLine([city, stateName, zip, country]),
      textColor: 'primary' as Color,
    },
  ];

  const viewItems = address.map(({ text, subtext, textColor }: SectionItemProps) => (
    <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
  ));

  const stopEditing = () => {
    setEditing(false);
  };

  const getSectionContent = () => {
    if (!editing) {
      return viewItems;
    }

    return (
      <BusinessAddress
        ctaLabel={t('confirm.summary.save')}
        onComplete={stopEditing}
        onCancel={stopEditing}
        hideHeader
      />
    );
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
      title={t('confirm.business-address.title')}
      actions={actions}
      IconComponent={IcoBuilding24}
      content={getSectionContent()}
      testID="business-address"
    />
  );
};

export default BusinessAddressSection;
