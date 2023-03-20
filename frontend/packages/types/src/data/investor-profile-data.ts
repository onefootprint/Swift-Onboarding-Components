import {
  InvestorProfileAnnualIncome,
  InvestorProfileDataAttribute,
  InvestorProfileDeclaration,
  InvestorProfileInvestmentGoal,
  InvestorProfileNetWorth,
  InvestorProfileRiskTolerance,
} from './investor-data-attribute';

export type InvestorProfileData = Partial<{
  [InvestorProfileDataAttribute.occupation]: string;
  [InvestorProfileDataAttribute.employedByBrokerageFirm]: string;
  [InvestorProfileDataAttribute.annualIncome]: InvestorProfileAnnualIncome;
  [InvestorProfileDataAttribute.netWorth]: InvestorProfileNetWorth;
  [InvestorProfileDataAttribute.investmentGoals]: InvestorProfileInvestmentGoal[];
  [InvestorProfileDataAttribute.riskTolerance]: InvestorProfileRiskTolerance;
  [InvestorProfileDataAttribute.declarations]: InvestorProfileDeclaration[];
}>;
