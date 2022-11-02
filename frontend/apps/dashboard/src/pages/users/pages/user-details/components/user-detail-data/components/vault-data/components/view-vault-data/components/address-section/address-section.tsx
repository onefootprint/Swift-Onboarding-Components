import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { UserVaultData } from 'src/pages/users/types/vault-data.types';

// import RiskSignalsOverview from '../../../risk-signals-overview';
import DataRow from '../data-row';
import DataSection from '../data-section';

type AddressSectionProps = {
  vaultData: UserVaultData;
};

const AddressSection = ({ vaultData }: AddressSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info.address');
  const { kycData } = vaultData;
  const country = kycData[UserDataAttribute.country];
  const addressLine1 = kycData[UserDataAttribute.addressLine1];
  const addressLine2 = kycData[UserDataAttribute.addressLine2];
  const city = kycData[UserDataAttribute.city];
  const zip = kycData[UserDataAttribute.zip];
  const state = kycData[UserDataAttribute.state];

  return (
    <DataSection
      // renderFooter={() => (
      //   <RiskSignalsOverview
      //     high={[
      //       {
      //         id: '1',
      //         severity: 'high',
      //         scope: 'Address',
      //         note: 'Warm Address Alert',
      //         noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
      //       },
      //     ]}
      //     medium={[
      //       {
      //         id: '2',
      //         severity: 'medium',
      //         scope: 'Address',
      //         note: 'Street Name Does Not Match',
      //         noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
      //       },
      //     ]}
      //     low={[
      //       {
      //         id: '3',
      //         severity: 'low',
      //         scope: 'Address',
      //         note: 'Zip Code Does Not Match',
      //         noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
      //       },
      //     ]}
      //   />
      // )}
      iconComponent={IcoBuilding24}
      title={t('title')}
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
