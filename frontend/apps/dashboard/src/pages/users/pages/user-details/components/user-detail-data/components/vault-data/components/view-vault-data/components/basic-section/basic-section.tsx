import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText224 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import useUser from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';
import getFullNameDataValue from 'src/pages/users/utils/get-full-name-data';

import DataSection from '../../../data-section';
import RiskSignals from '../../../risk-signals';
import DataRow from '../data-row';

const BasicSection = () => {
  const { t, allT } = useTranslation('pages.user-details.user-info.basic');
  const userId = useUserId();
  const {
    user: { vaultData },
  } = useUser(userId);
  const { kycData } = vaultData ?? {};
  const firstName = kycData?.[UserDataAttribute.firstName];
  const lastName = kycData?.[UserDataAttribute.lastName];
  const email = kycData?.[UserDataAttribute.email];
  const phoneNumber = kycData?.[UserDataAttribute.phoneNumber];

  return (
    <DataSection
      iconComponent={IcoFileText224}
      title={t('title')}
      footer={<RiskSignals type="basic" />}
    >
      {firstName !== undefined && lastName !== undefined && (
        <DataRow
          data={getFullNameDataValue(vaultData)}
          title={allT('collected-kyc-data-options.name')}
        />
      )}
      {email !== undefined && (
        <DataRow
          title={allT('collected-kyc-data-options.email')}
          data={email}
        />
      )}
      {phoneNumber !== undefined && (
        <DataRow
          title={allT('collected-kyc-data-options.phone_number')}
          data={phoneNumber}
        />
      )}
    </DataSection>
  );
};

export default BasicSection;
