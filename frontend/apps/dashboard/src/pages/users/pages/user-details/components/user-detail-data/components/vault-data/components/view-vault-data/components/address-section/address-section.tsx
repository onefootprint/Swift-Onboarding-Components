import { useTranslation } from '@onefootprint/hooks';
import { IcoBuilding24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { UserAttributes } from 'src/pages/users/hooks/use-user-data';

// import RiskSignalsOverview from '../../../risk-signals-overview';
import DataRow from '../data-row';
import DataSection from '../data-section';

type AddressSectionProps = {
  identityDataAttributes: UserDataAttribute[];
  attributes: UserAttributes;
};

const AddressSection = ({
  identityDataAttributes,
  attributes,
}: AddressSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details');
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
      title={t('user-info.address.title')}
    >
      {identityDataAttributes.includes(UserDataAttribute.country) && (
        <DataRow
          title={allT('user-data-attributes.country')}
          data={attributes.country}
        />
      )}
      {identityDataAttributes.includes(UserDataAttribute.addressLine1) && (
        <DataRow
          title={allT('user-data-attributes.address-line1')}
          data={attributes.addressLine1}
        />
      )}
      {identityDataAttributes.includes(UserDataAttribute.addressLine2) && (
        <DataRow
          data={attributes.addressLine2}
          title={allT('user-data-attributes.address-line2')}
        />
      )}
      {identityDataAttributes.includes(UserDataAttribute.city) && (
        <DataRow
          title={allT('user-data-attributes.city')}
          data={attributes.city}
        />
      )}
      {identityDataAttributes.includes(UserDataAttribute.zip) && (
        <DataRow
          title={allT('user-data-attributes.zip')}
          data={attributes.zip}
        />
      )}
      {identityDataAttributes.includes(UserDataAttribute.state) && (
        <DataRow
          title={allT('user-data-attributes.state')}
          data={attributes.state}
        />
      )}
    </DataSection>
  );
};

export default AddressSection;
