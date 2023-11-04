import type { InvestorProfileDI } from './di';
import type {
  InvestorProfileAnnualIncome,
  InvestorProfileDeclaration,
  InvestorProfileInvestmentGoal,
  InvestorProfileNetWorth,
  InvestorProfileRiskTolerance,
} from './investor-data-attribute';

export type InvestorProfileData = Partial<{
  [InvestorProfileDI.occupation]: string;
  [InvestorProfileDI.employedByBrokerageFirm]: string;
  [InvestorProfileDI.annualIncome]: InvestorProfileAnnualIncome;
  [InvestorProfileDI.netWorth]: InvestorProfileNetWorth;
  [InvestorProfileDI.investmentGoals]: InvestorProfileInvestmentGoal[];
  [InvestorProfileDI.riskTolerance]: InvestorProfileRiskTolerance;
  [InvestorProfileDI.declarations]: InvestorProfileDeclaration[];
}>;
