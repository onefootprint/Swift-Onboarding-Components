import type { InvestorProfileDI } from './di';
import type {
  InvestorProfileAnnualIncome,
  InvestorProfileDeclaration,
  InvestorProfileFundingSources,
  InvestorProfileInvestmentGoal,
  InvestorProfileNetWorth,
  InvestorProfileRiskTolerance,
} from './investor-data-attribute';

export type InvestorProfileData = Partial<{
  [InvestorProfileDI.employmentStatus]: string;
  [InvestorProfileDI.occupation]: string;
  [InvestorProfileDI.employer]: string;
  [InvestorProfileDI.annualIncome]: InvestorProfileAnnualIncome;
  [InvestorProfileDI.netWorth]: InvestorProfileNetWorth;
  [InvestorProfileDI.fundingSources]: InvestorProfileFundingSources[];
  [InvestorProfileDI.investmentGoals]: InvestorProfileInvestmentGoal[];
  [InvestorProfileDI.riskTolerance]: InvestorProfileRiskTolerance;
  [InvestorProfileDI.declarations]: InvestorProfileDeclaration[];
  [InvestorProfileDI.seniorExecutiveSymbols]: string[];
  [InvestorProfileDI.familyMemberNames]: string[];
  [InvestorProfileDI.politicalOrganization]: string;
  [InvestorProfileDI.brokerageFirmEmployer]: string;
}>;
