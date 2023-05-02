import { IdDI, InvestorProfileDI } from '@onefootprint/types';
import { CountryCode } from '@onefootprint/types/src/data/countries';

export type IdvProps = {
  authToken?: string; // If provided, will skip identify step
  tenantPk?: string; // If provided, will complete onboarding
  data?: IdvData; // If provided, will bootstrap identify and pre-fill fields on onboarding
  onClose?: () => void;
  onComplete?: (validationToken: string, delay?: number) => void;
};

export type IdvData = Partial<{
  [InvestorProfileDI.occupation]: string;
  [InvestorProfileDI.employedByBrokerageFirm]: string;
  [InvestorProfileDI.annualIncome]: string;
  [InvestorProfileDI.netWorth]: string;
  [InvestorProfileDI.investmentGoals]: string;
  [InvestorProfileDI.riskTolerance]: string;
  [InvestorProfileDI.declarations]: string;
  [IdDI.firstName]: string;
  [IdDI.lastName]: string;
  [IdDI.email]: string;
  [IdDI.phoneNumber]: string;
  [IdDI.dob]: string;
  [IdDI.ssn9]: string;
  [IdDI.ssn4]: string;
  [IdDI.addressLine1]: string;
  [IdDI.addressLine2]: string;
  [IdDI.city]: string;
  [IdDI.state]: string;
  [IdDI.country]: CountryCode;
  [IdDI.zip]: string;
}>;
