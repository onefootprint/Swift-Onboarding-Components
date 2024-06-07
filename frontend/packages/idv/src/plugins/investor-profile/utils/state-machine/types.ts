import type { InvestorProfileDI, InvestorProfileData } from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type EmploymentData = Pick<
  InvestorProfileData,
  InvestorProfileDI.employmentStatus | InvestorProfileDI.occupation | InvestorProfileDI.employer
>;

export type IncomeData = Required<Pick<InvestorProfileData, InvestorProfileDI.annualIncome>>;

export type NetWorthData = Required<Pick<InvestorProfileData, InvestorProfileDI.netWorth>>;

export type InvestmentGoalsData = Required<Pick<InvestorProfileData, InvestorProfileDI.investmentGoals>>;

export type RiskToleranceData = Required<Pick<InvestorProfileData, InvestorProfileDI.riskTolerance>>;

export type DeclarationData = Required<Pick<InvestorProfileData, InvestorProfileDI.declarations>> &
  Partial<
    Pick<
      InvestorProfileData,
      | InvestorProfileDI.seniorExecutiveSymbols
      | InvestorProfileDI.familyMemberNames
      | InvestorProfileDI.politicalOrganization
      | InvestorProfileDI.brokerageFirmEmployer
    >
  >;

export type MachineContext = {
  // Plugin context
  device?: DeviceInfo;
  authToken?: string;
  // Whether to show the animation at the start, if transitioning from collect-kyc-data
  // In the future, we can generalize to use different icons to indicate prev plugin type
  showTransition?: boolean;
  data: InvestorProfileData;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        device: DeviceInfo;
        showTransition?: boolean;
      };
    }
  | {
      type: 'employmentSubmitted';
      payload: EmploymentData;
    }
  | {
      type: 'incomeSubmitted';
      payload: IncomeData;
    }
  | {
      type: 'netWorthSubmitted';
      payload: NetWorthData;
    }
  | {
      type: 'investmentGoalsSubmitted';
      payload: InvestmentGoalsData;
    }
  | {
      type: 'riskToleranceSubmitted';
      payload: RiskToleranceData;
    }
  | {
      type: 'declarationsSubmitted';
      payload: DeclarationData;
    }
  | {
      type: 'navigatedToPrevPage';
    };
