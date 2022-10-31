import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { UserAttributes } from 'src/pages/users/hooks/use-user-data';

// import RiskSignalsOverview from '../../../risk-signals-overview';
import DataRow from '../data-row';
import DataSection from '../data-section';

type IdentitySectionProps = {
  identityDataAttributes: UserDataAttribute[];
  attributes: UserAttributes;
};

const IdentitySection = ({
  identityDataAttributes,
  attributes,
}: IdentitySectionProps) => {
  const { t, allT } = useTranslation('pages.user-details');

  return (
    <DataSection
      iconComponent={IcoUserCircle24}
      // renderFooter={() => (
      //   <RiskSignalsOverview
      //     high={[
      //       {
      //         id: '1',
      //         severity: 'high',
      //         scope: 'Identity',
      //         note: 'SSN Issued Prior to DOB',
      //         noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
      //       },
      //     ]}
      //     medium={[
      //       {
      //         id: '2',
      //         severity: 'medium',
      //         scope: 'Identity',
      //         note: 'SSN tied to multiple names',
      //         noteDetails: 'Lorem Ipsum dolor simet at magna lorem ipsum',
      //       },
      //     ]}
      //     low={[]}
      //   />
      // )}
      title={t('user-info.identity.title')}
    >
      {identityDataAttributes.includes(UserDataAttribute.ssn9) && (
        <DataRow
          title={allT('collected-data-options.ssn9')}
          data={attributes.ssn9}
        />
      )}
      {identityDataAttributes.includes(UserDataAttribute.ssn4) && (
        <DataRow
          title={allT('collected-data-options.ssn4')}
          data={attributes.ssn4}
        />
      )}
      {identityDataAttributes.includes(UserDataAttribute.dob) && (
        <DataRow
          title={allT('collected-data-options.dob')}
          data={attributes.dob}
        />
      )}
    </DataSection>
  );
};

export default IdentitySection;
