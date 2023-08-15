import { InvestorProfileDI } from './di';
import {
  InvestorProfileAnnualIncome,
  InvestorProfileDeclaration,
  InvestorProfileInvestmentGoal,
  InvestorProfileNetWorth,
  InvestorProfileRiskTolerance,
} from './investor-data-attribute';

export type InvestorProfileData = Partial<{
  [InvestorProfileDI.status]: string;
  [InvestorProfileDI.occupation]: string;
  [InvestorProfileDI.employer]: string;
  [InvestorProfileDI.annualIncome]: InvestorProfileAnnualIncome;
  [InvestorProfileDI.netWorth]: InvestorProfileNetWorth;
  [InvestorProfileDI.investmentGoals]: InvestorProfileInvestmentGoal[];
  [InvestorProfileDI.riskTolerance]: InvestorProfileRiskTolerance;
  [InvestorProfileDI.declarations]: InvestorProfileDeclaration[];
}>;
