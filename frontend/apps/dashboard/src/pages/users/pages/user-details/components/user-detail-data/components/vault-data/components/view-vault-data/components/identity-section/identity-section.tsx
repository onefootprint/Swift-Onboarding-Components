import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { UserDataAttribute } from '@onefootprint/types';
import React from 'react';
import useUser from 'src/hooks/use-user';
import useUserId from 'src/pages/users/pages/user-details/hooks/use-user-id';

import DataSection from '../../../data-section';
import RiskSignals from '../../../risk-signals';
import DataRow from '../data-row';

const IdentitySection = () => {
  const { t, allT } = useTranslation('pages.user-details.user-info.identity');
  const userId = useUserId();
  const {
    user: { vaultData },
  } = useUser(userId);
  const { kycData } = vaultData ?? {};
  const ssn9 = kycData?.[UserDataAttribute.ssn9];
  const ssn4 = kycData?.[UserDataAttribute.ssn4];
  const dob = kycData?.[UserDataAttribute.dob];

  return (
    <DataSection
      iconComponent={IcoUserCircle24}
      title={t('title')}
      footer={<RiskSignals type="identity" />}
    >
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
