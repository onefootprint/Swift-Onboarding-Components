import { InvestorProfileDI, InvestorProfileData } from '@onefootprint/types';
import React from 'react';
import useEffectOnceStrict from '../../../../../src/components/identify/hooks/use-effect-once-strict';
import { useDecryptUser } from '../../../../queries';

type InitProps = {
  authToken?: string;
  children: React.ReactNode;
  onError: (error?: unknown) => void;
  onSuccess: (data: InvestorProfileData) => void;
};

const investorProfileFields: `${InvestorProfileDI}`[] = [
  'investor_profile.annual_income',
  'investor_profile.brokerage_firm_employer',
  'investor_profile.declarations',
  'investor_profile.employer',
  'investor_profile.employment_status',
  'investor_profile.family_member_names',
  'investor_profile.investment_goals',
  'investor_profile.net_worth',
  'investor_profile.funding_sources',
  'investor_profile.occupation',
  'investor_profile.political_organization',
  'investor_profile.risk_tolerance',
  'investor_profile.senior_executive_symbols',
];

const Init = ({ authToken, children, onError, onSuccess }: InitProps) => {
  const mutDecryptUser = useDecryptUser();

  const fetchInvestorProfileData = (authToken: string) => {
    mutDecryptUser.mutate(
      {
        authToken,
        fields: investorProfileFields,
      } /** @ts-expect-error: string | string[] | undefined vs string */,
      { onError, onSuccess },
    );
  };

  useEffectOnceStrict(() => {
    if (authToken) {
      fetchInvestorProfileData(authToken);
    }
  });

  return children;
};

export default Init;
