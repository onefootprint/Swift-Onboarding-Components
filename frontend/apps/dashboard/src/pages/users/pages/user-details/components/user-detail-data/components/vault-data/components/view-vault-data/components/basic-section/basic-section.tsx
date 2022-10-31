import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText224 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { nameData } from 'src/pages/users/hooks/use-join-users';
import { UserAttributes } from 'src/pages/users/hooks/use-user-data';

// import RiskSignalsOverview from '../../../risk-signals-overview';
import DataRow from '../data-row';
import DataSection from '../data-section';

type BasicSectionProps = {
  identityDataAttributes: UserDataAttribute[];
  attributes: UserAttributes;
};

const BasicSection = ({
  identityDataAttributes,
  attributes,
}: BasicSectionProps) => {
  const { t, allT } = useTranslation('pages.user-details');

  return (
    <DataSection
      iconComponent={IcoFileText224}
      // renderFooter={() => (
      //   <RiskSignalsOverview
      //     high={[]}
      //     medium={[
      //       {
      //         id: '1',
      //         severity: 'medium',
      //         scope: 'Identity',
      //         note: 'High Risk Email Domain',
      //         noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
      //       },
      //       {
      //         id: '2',
      //         severity: 'medium',
      //         scope: 'Phone number',
      //         note: 'VoIP Number',
      //         noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
      //       },
      //     ]}
      //     low={[]}
      //   />
      // )}
      title={t('user-info.basic.title')}
    >
      {identityDataAttributes.includes(UserDataAttribute.firstName) &&
        identityDataAttributes.includes(UserDataAttribute.lastName) && (
          <DataRow
            data={nameData(attributes)}
            title={allT('collected-data-options.name')}
          />
        )}
      {identityDataAttributes.includes(UserDataAttribute.email) && (
        <DataRow
          title={allT('collected-data-options.email')}
          data={attributes.email}
        />
      )}
      {identityDataAttributes.includes(UserDataAttribute.phoneNumber) && (
        <DataRow
          title={allT('collected-data-options.phone_number')}
          data={attributes.phoneNumber}
        />
      )}
    </DataSection>
  );
};

export default BasicSection;
