import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import useUser from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

import DataSection from '../../../data-section';
import RiskSignals from '../../../risk-signals';
import DataRow from '../data-row';

const AddressSection = () => {
  const { t, allT } = useTranslation('pages.user-details.user-info.address');
  const userId = useUserId();
  const {
    user: { vaultData },
  } = useUser(userId);
  const { kycData } = vaultData ?? {};
  const country = kycData?.[UserDataAttribute.country];
  const addressLine1 = kycData?.[UserDataAttribute.addressLine1];
  const addressLine2 = kycData?.[UserDataAttribute.addressLine2];
  const city = kycData?.[UserDataAttribute.city];
  const zip = kycData?.[UserDataAttribute.zip];
  const state = kycData?.[UserDataAttribute.state];

  return (
    <DataSection
      iconComponent={IcoBuilding24}
      title={t('title')}
      footer={<RiskSignals type="address" />}
    >
      {country !== undefined && (
        <DataRow title={allT('user-data-attributes.country')} data={country} />
      )}
      {addressLine1 !== undefined && (
        <DataRow
          title={allT('user-data-attributes.address-line1')}
          data={addressLine1}
        />
      )}
      {addressLine2 !== undefined && (
        <DataRow
          data={addressLine2}
          title={allT('user-data-attributes.address-line2')}
        />
      )}
      {city !== undefined && (
        <DataRow title={allT('user-data-attributes.city')} data={city} />
      )}
      {zip !== undefined && (
        <DataRow title={allT('user-data-attributes.zip')} data={zip} />
      )}
      {state !== undefined && (
        <DataRow title={allT('user-data-attributes.state')} data={state} />
      )}
    </DataSection>
  );
};

export default AddressSection;
