import { useTranslation } from '@onefootprint/hooks';
import { IcoFileText224 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { UserVaultData } from 'src/hooks/use-user-store';
import getFullNameDataValue from 'src/pages/users/utils/get-full-name-data';

import useRiskSignalsOverview from '../../../../hooks/use-risk-signals-overview';
import DataSection from '../../../data-section';
import RiskSignalsOverview from '../../../risk-signals-overview';
import DataRow from '../data-row';

type BasicSectionProps = {
  vaultData: UserVaultData;
};

const BasicSection = ({ vaultData }: BasicSectionProps) => {
  const riskSignalsOverview = useRiskSignalsOverview();
  const { t, allT } = useTranslation('pages.user-details.user-info.basic');
  const { kycData } = vaultData;
  const firstName = kycData[UserDataAttribute.firstName];
  const lastName = kycData[UserDataAttribute.lastName];
  const email = kycData[UserDataAttribute.email];
  const phoneNumber = kycData[UserDataAttribute.phoneNumber];

  return (
    <DataSection
      iconComponent={IcoFileText224}
      title={t('title')}
      footer={
        <RiskSignalsOverview
          data={riskSignalsOverview.data?.basic}
          error={riskSignalsOverview.error}
          isLoading={riskSignalsOverview.isLoading}
        />
      }
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
