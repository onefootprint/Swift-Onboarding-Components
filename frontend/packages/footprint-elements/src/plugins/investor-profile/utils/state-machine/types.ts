import { DeviceInfo } from '@onefootprint/hooks';
import {
  InvestorProfileData,
  InvestorProfileDataAttribute,
} from '@onefootprint/types';

export type EmploymentData = Required<
  Pick<InvestorProfileData, InvestorProfileDataAttribute.employmentStatus> &
    Pick<InvestorProfileData, InvestorProfileDataAttribute.occupation>
>;

export type EmployedByBrokerageData = Required<
  Pick<InvestorProfileData, InvestorProfileDataAttribute.employedByBrokerage> &
    Pick<
      InvestorProfileData,
      InvestorProfileDataAttribute.employedByBrokerageFirm
    >
>;

export type IncomeData = Required<
  Pick<InvestorProfileData, InvestorProfileDataAttribute.annualIncome>
>;

export type NetWorthData = Required<
  Pick<InvestorProfileData, InvestorProfileDataAttribute.netWorth>
>;

export type InvestmentGoalsData = Required<
  Pick<InvestorProfileData, InvestorProfileDataAttribute.investmentGoals>
>;

export type RiskToleranceData = Required<
  Pick<InvestorProfileData, InvestorProfileDataAttribute.riskTolerance>
>;

export type DeclarationData = Required<
  Pick<InvestorProfileData, InvestorProfileDataAttribute.declarations>
>;

export type MachineContext = {
  // Plugin context
  device?: DeviceInfo;
  authToken?: string;
  data: InvestorProfileData;
};

export type MachineEvents =
  | {
      type: 'receivedContext';
      payload: {
        authToken: string;
        device: DeviceInfo;
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
      type: 'conflictOfInterestSubmitted';
      payload: DeclarationData;
    }
  | {
      type: 'navigatedToPrevPage';
    };
