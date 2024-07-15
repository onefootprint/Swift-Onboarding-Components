import { InvestorProfileDI } from '@onefootprint/types';
import {
  isMissingEmploymentData,
  isMissingIncomeData,
  isMissingInvestmentGoalsData,
  isMissingNetWorthData,
  isMissingRiskToleranceData,
} from './machine';

describe('isMissingEmploymentData', () => {
  it('should return true if employment status is undefined', () => {
    const result = isMissingEmploymentData({ data: { [InvestorProfileDI.employmentStatus]: undefined } });
    expect(result).toBe(true);
  });

  it('should return true if employment status is empty', () => {
    const result = isMissingEmploymentData({ data: { [InvestorProfileDI.employmentStatus]: '' } });
    expect(result).toBe(true);
  });

  it('should return true if employment status is employed but occupation is undefined', () => {
    const result = isMissingEmploymentData({
      data: {
        [InvestorProfileDI.employmentStatus]: 'employed',
        [InvestorProfileDI.employer]: 'Company A',
      },
    });
    expect(result).toBe(true);
  });

  it('should return true if employment status is employed but employer is undefined', () => {
    const result = isMissingEmploymentData({
      data: {
        [InvestorProfileDI.employmentStatus]: 'employed',
        [InvestorProfileDI.occupation]: 'Doctor',
      },
    });
    expect(result).toBe(true);
  });

  it('should return false if employment status is employed and both occupation and employer are present', () => {
    const result = isMissingEmploymentData({
      data: {
        [InvestorProfileDI.employmentStatus]: 'employed',
        [InvestorProfileDI.occupation]: 'Doctor',
        [InvestorProfileDI.employer]: 'Company A',
      },
    });
    expect(result).toBe(false);
  });
});

describe('isMissingIncomeData', () => {
  it('should return true if annual income is missing', () => {
    const result = isMissingIncomeData({ data: {} });
    expect(result).toBe(true);
  });

  it('should return false if annual income is present', () => {
    /** @ts-expect-error enum vs string */
    const result = isMissingIncomeData({ data: { [InvestorProfileDI.annualIncome]: 'le25k' } });
    expect(result).toBe(false);
  });
});

describe('isMissingNetWorthData', () => {
  it('should return true if net worth data is missing', () => {
    expect(isMissingNetWorthData({ data: {} })).toBe(true);
  });

  it('should return false if net worth data is present', () => {
    /** @ts-expect-error enum vs string */
    expect(isMissingNetWorthData({ data: { [InvestorProfileDI.netWorth]: 'le50k' } })).toBe(false);
  });
});

describe('isMissingInvestmentGoalsData', () => {
  it('should return true if investment goals is undefined', () => {
    expect(isMissingInvestmentGoalsData({ data: {} })).toBe(true);
  });

  it('should return true if investment goals is not an array', () => {
    /** @ts-expect-error enum vs string */
    expect(isMissingInvestmentGoalsData({ data: { [InvestorProfileDI.investmentGoals]: 'foo' } })).toBe(true);
  });

  it('should return true if investment goals is an empty array', () => {
    expect(isMissingInvestmentGoalsData({ data: { [InvestorProfileDI.investmentGoals]: [] } })).toBe(true);
  });

  it('should return false if investment goals is a non-empty array', () => {
    /** @ts-expect-error enum vs string */
    expect(isMissingInvestmentGoalsData({ data: { [InvestorProfileDI.investmentGoals]: ['foo'] } })).toBe(false);
  });
});

describe('isMissingRiskToleranceData', () => {
  it('should return true for missing data object', () => {
    const result = isMissingRiskToleranceData({ data: {} });
    expect(result).toBe(true);
  });

  it('should return true for data object with missing risk tolerance value', () => {
    /** @ts-expect-error enum vs string */
    const result = isMissingRiskToleranceData({ data: { [InvestorProfileDI.riskTolerance]: '' } });
    expect(result).toBe(true);
  });

  it('should return false for data object with risk tolerance value present', () => {
    /** @ts-expect-error enum vs string */
    const result = isMissingRiskToleranceData({ data: { [InvestorProfileDI.riskTolerance]: 'aggressive' } });
    expect(result).toBe(false);
  });
});
