import { InvestorProfileData, InvestorProfileDI } from '@onefootprint/types';

import type { DeviceInfo } from '../../../../hooks/ui/use-device-info';

export type EmploymentData = Pick<
  InvestorProfileData,
  InvestorProfileDI.occupation
>;

export type EmployedByBrokerageData = Pick<
  InvestorProfileData,
  InvestorProfileDI.employedByBrokerageFirm
>;

export type IncomeData = Required<
  Pick<InvestorProfileData, InvestorProfileDI.annualIncome>
>;

export type NetWorthData = Required<
  Pick<InvestorProfileData, InvestorProfileDI.netWorth>
>;

export type InvestmentGoalsData = Required<
  Pick<InvestorProfileData, InvestorProfileDI.investmentGoals>
>;

export type RiskToleranceData = Required<
  Pick<InvestorProfileData, InvestorProfileDI.riskTolerance>
>;

export type DeclarationData = Required<
  Pick<InvestorProfileData, InvestorProfileDI.declarations>
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
      type: 'brokerageEmploymentSubmitted';
      payload: EmployedByBrokerageData;
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
