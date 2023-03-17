import {
  InvestorProfileAnnualIncome,
  InvestorProfileDataAttribute,
  InvestorProfileDeclaration,
  InvestorProfileEmployedByBrokerage,
  InvestorProfileEmploymentStatus,
  InvestorProfileInvestmentGoal,
  InvestorProfileNetWorth,
  InvestorProfileRiskTolerance,
} from './investor-data-attribute';

export type InvestorProfileData = Partial<{
  [InvestorProfileDataAttribute.employmentStatus]: InvestorProfileEmploymentStatus;
  [InvestorProfileDataAttribute.occupation]: string;
  [InvestorProfileDataAttribute.employedByBrokerage]: InvestorProfileEmployedByBrokerage;
  [InvestorProfileDataAttribute.employedByBrokerageFirm]: string;
  [InvestorProfileDataAttribute.annualIncome]: InvestorProfileAnnualIncome;
  [InvestorProfileDataAttribute.netWorth]: InvestorProfileNetWorth;
  [InvestorProfileDataAttribute.investmentGoals]: InvestorProfileInvestmentGoal[];
  [InvestorProfileDataAttribute.riskTolerance]: InvestorProfileRiskTolerance;
  [InvestorProfileDataAttribute.declarations]: InvestorProfileDeclaration[];
}>;
