import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedInvestorProfileDataOption,
  InvestorProfileDataAttribute,
  RoleScope,
} from '@onefootprint/types';
import usePermissions from 'src/hooks/use-permissions';
import { User, UserVaultData } from 'src/pages/users/users.types';

import useFormValues from '../../../hooks/use-form-values';

// TODO: https://linear.app/footprint/issue/FP-3139/dashboard-broker-use-real-fields
const useFields = (
  user: User,
  vaultData: UserVaultData,
  isDecrypting: boolean,
) => {
  const { t, allT } = useTranslation(
    'pages.user-details.user-info.investor-profile',
  );
  const { hasPermission } = usePermissions();
  const { investorProfile } = vaultData;
  const values = useFormValues();

  const getData = (attribute: InvestorProfileDataAttribute) => {
    const canDecrypt = hasPermission(RoleScope.decryptInvestorProfile);
    const canAccessData = user.onboarding?.canAccessData.includes(
      CollectedInvestorProfileDataOption.investorProfile,
    );
    const value = investorProfile[attribute];
    const hasValue = user.attributes.includes(attribute);
    const canAccess = !user.isPortable || !!canAccessData;
    const isDataDecrypted = !!vaultData.investorProfile[attribute];

    return {
      canAccess,
      canSelect: hasValue && !isDataDecrypted && canDecrypt && canAccess,
      checked: !!values.investorProfile[attribute],
      hasPermission: canDecrypt,
      isDataDecrypted,
      hasValue,
      label: allT(`investor-profile-attributes.${attribute}`),
      name: `investorProfile.${attribute}`,
      showCheckbox: isDecrypting,
      value,
    };
  };

  const left = [
    {
      title: t('employment-status-and-occupation'),
      fields: [getData(InvestorProfileDataAttribute.occupation)],
    },
    {
      title: t('brokerage-firm'),
      fields: [getData(InvestorProfileDataAttribute.employedByBrokerageFirm)],
    },
    {
      title: t('annual-income'),
      fields: [getData(InvestorProfileDataAttribute.annualIncome)],
    },
    {
      title: t('net-worth'),
      fields: [getData(InvestorProfileDataAttribute.netWorth)],
    },
  ];
  const right = [
    {
      title: t('investment-goals'),
      fields: [getData(InvestorProfileDataAttribute.investmentGoals)],
    },
    {
      title: t('risk-tolerance'),
      fields: [getData(InvestorProfileDataAttribute.riskTolerance)],
    },
    {
      title: t('immediate-family'),
      fields: [
        getData(InvestorProfileDataAttribute.declarations),
        getData(InvestorProfileDataAttribute.complianceLetter),
      ],
    },
  ];

  return [left, right];
};

export default useFields;
