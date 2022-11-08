import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import { UserVaultData } from 'src/pages/users/types/vault-data.types';

import DataSection from '../../../data-section';
import DataRow from '../data-row';

type IdentitySectionProps = {
  vaultData: UserVaultData;
};

const IdentitySection = ({ vaultData }: IdentitySectionProps) => {
  const { t, allT } = useTranslation('pages.user-details.user-info.identity');
  const { kycData } = vaultData;
  const ssn9 = kycData[UserDataAttribute.ssn9];
  const ssn4 = kycData[UserDataAttribute.ssn4];
  const dob = kycData[UserDataAttribute.dob];
  return (
    <DataSection iconComponent={IcoUserCircle24} title={t('title')}>
      {ssn9 !== undefined && (
        <DataRow title={allT('collected-kyc-data-options.ssn9')} data={ssn9} />
      )}
      {ssn4 !== undefined && (
        <DataRow title={allT('collected-kyc-data-options.ssn4')} data={ssn4} />
      )}
      {dob !== undefined && (
        <DataRow title={allT('collected-kyc-data-options.dob')} data={dob} />
      )}
    </DataSection>
  );
};

export default IdentitySection;
