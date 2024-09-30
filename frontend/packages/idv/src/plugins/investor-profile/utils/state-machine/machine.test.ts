import { InvestorProfileDI, InvestorProfileFundingSources } from '@onefootprint/types';
import {
  isMissingEmploymentData,
  isMissingFundingSources,
  isMissingIncomeData,
  isMissingInvestmentGoalsData,
  isMissingNetWorthData,
  isMissingRiskToleranceData,
  trackInitializedSteps,
} from './machine';

describe('isMissingEmploymentData', () => {
  it('should return true if employment status is undefined', () => {
    const result = isMissingEmploymentData({
      data: { [InvestorProfileDI.employmentStatus]: undefined },
    });
    expect(result).toBe(true);
  });

  it('should return true if employment status is empty', () => {
    const result = isMissingEmploymentData({
      data: { [InvestorProfileDI.employmentStatus]: '' },
    });
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
    const result = isMissingIncomeData({
      /** @ts-expect-error enum vs string */
      data: { [InvestorProfileDI.annualIncome]: 'le25k' },
    });
    expect(result).toBe(false);
  });
});

describe('isMissingNetWorthData', () => {
  it('should return true if net worth data is missing', () => {
    expect(isMissingNetWorthData({ data: {} })).toBe(true);
  });

  it('should return false if net worth data is present', () => {
    expect(
      isMissingNetWorthData({
        /** @ts-expect-error enum vs string */
        data: { [InvestorProfileDI.netWorth]: 'le50k' },
      }),
    ).toBe(false);
  });
});

describe('isMissingInvestmentGoalsData', () => {
  it('should return true if investment goals is undefined', () => {
    expect(isMissingInvestmentGoalsData({ data: {} })).toBe(true);
  });

  it('should return true if investment goals is not an array', () => {
    expect(
      isMissingInvestmentGoalsData({
        /** @ts-expect-error enum vs string */
        data: { [InvestorProfileDI.investmentGoals]: 'foo' },
      }),
    ).toBe(true);
  });

  it('should return true if investment goals is an empty array', () => {
    expect(
      isMissingInvestmentGoalsData({
        data: { [InvestorProfileDI.investmentGoals]: [] },
      }),
    ).toBe(true);
  });

  it('should return false if investment goals is a non-empty array', () => {
    expect(
      isMissingInvestmentGoalsData({
        /** @ts-expect-error enum vs string */
        data: { [InvestorProfileDI.investmentGoals]: ['foo'] },
      }),
    ).toBe(false);
  });
});

describe('isMissingFundingSources', () => {
  it('should return true for missing data object', () => {
    const result = isMissingFundingSources({ data: {} });
    expect(result).toBe(true);
  });

  it('should return true for data object with missing funding sources', () => {
    const result = isMissingFundingSources({
      data: {
        [InvestorProfileDI.fundingSources]: [],
      },
    });
    expect(result).toBe(true);
  });

  it('should return false for data object with funding sources', () => {
    const result = isMissingFundingSources({
      data: {
        [InvestorProfileDI.fundingSources]: [InvestorProfileFundingSources.businessIncome],
      },
    });
    expect(result).toBe(false);
  });
});

describe('isMissingRiskToleranceData', () => {
  it('should return true for missing data object', () => {
    const result = isMissingRiskToleranceData({ data: {} });
    expect(result).toBe(true);
  });

  it('should return true for data object with missing risk tolerance value', () => {
    const result = isMissingRiskToleranceData({
      /** @ts-expect-error enum vs string */
      data: { [InvestorProfileDI.riskTolerance]: '' },
    });
    expect(result).toBe(true);
  });

  it('should return false for data object with risk tolerance value present', () => {
    const result = isMissingRiskToleranceData({
      /** @ts-expect-error enum vs string */
      data: { [InvestorProfileDI.riskTolerance]: 'aggressive' },
    });
    expect(result).toBe(false);
  });
});

describe('trackInitializedSteps', () => {
  it('should not call tracker for empty data', () => {
    const tracker = jest.fn();
    const data = {};
    trackInitializedSteps(tracker, data);
    expect(tracker).toHaveBeenCalledTimes(0);
  });

  it('should track employment data 1/2', () => {
    const tracker = jest.fn();
    const data = {
      [InvestorProfileDI.employmentStatus]: 'employed',
      [InvestorProfileDI.occupation]: 'occupation',
      [InvestorProfileDI.employer]: 'employer',
    };
    trackInitializedSteps(tracker, data);
    expect(tracker).toHaveBeenCalledTimes(1);
    expect(tracker).toHaveBeenCalledWith('investor-profile:employment-submit');
  });

  it('should track employment data 2/2', () => {
    const tracker = jest.fn();
    const data = { [InvestorProfileDI.employmentStatus]: 'unemployed' };

    trackInitializedSteps(tracker, data);
    expect(tracker).toHaveBeenCalledTimes(1);
    expect(tracker).toHaveBeenCalledWith('investor-profile:employment-submit');
  });

  it('should track income data', () => {
    const tracker = jest.fn();
    const data = {
      [InvestorProfileDI.employmentStatus]: 'unemployed',
      [InvestorProfileDI.annualIncome]: 'le25k',
    };
    /** @ts-expect-error enum vs string */
    trackInitializedSteps(tracker, data);
    expect(tracker).toHaveBeenCalledTimes(2);
    expect(tracker).toHaveBeenCalledWith('investor-profile:employment-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:income-submit');
  });

  it('should track net worth data', () => {
    const tracker = jest.fn();
    const data = {
      [InvestorProfileDI.employmentStatus]: 'unemployed',
      [InvestorProfileDI.annualIncome]: 'le25k',
      [InvestorProfileDI.netWorth]: 'le50k',
    };
    /** @ts-expect-error enum vs string */
    trackInitializedSteps(tracker, data);
    expect(tracker).toHaveBeenCalledTimes(3);
    expect(tracker).toHaveBeenCalledWith('investor-profile:employment-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:income-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:net-worth-submit');
  });

  it('should track funding sources data', () => {
    const tracker = jest.fn();
    const data = {
      [InvestorProfileDI.employmentStatus]: 'unemployed',
      [InvestorProfileDI.annualIncome]: 'le25k',
      [InvestorProfileDI.netWorth]: 'le50k',
      [InvestorProfileDI.fundingSources]: [InvestorProfileFundingSources.businessIncome],
    };
    /** @ts-expect-error enum vs string */
    trackInitializedSteps(tracker, data);
    expect(tracker).toHaveBeenCalledTimes(4);
    expect(tracker).toHaveBeenCalledWith('investor-profile:employment-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:income-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:net-worth-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:funding-sources-submit');
  });

  it('should track investment goals data', () => {
    const tracker = jest.fn();
    const data = {
      [InvestorProfileDI.employmentStatus]: 'unemployed',
      [InvestorProfileDI.annualIncome]: 'le25k',
      [InvestorProfileDI.netWorth]: 'le50k',
      [InvestorProfileDI.fundingSources]: [InvestorProfileFundingSources.businessIncome],
      [InvestorProfileDI.investmentGoals]: ['foo'],
    };
    /** @ts-expect-error enum vs string */
    trackInitializedSteps(tracker, data);
    expect(tracker).toHaveBeenCalledTimes(5);
    expect(tracker).toHaveBeenCalledWith('investor-profile:employment-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:income-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:net-worth-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:funding-sources-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:investment-goals-submit');
  });

  it('should track risk tolerance data', () => {
    const tracker = jest.fn();
    const data = {
      [InvestorProfileDI.employmentStatus]: 'unemployed',
      [InvestorProfileDI.annualIncome]: 'le25k',
      [InvestorProfileDI.netWorth]: 'le50k',
      [InvestorProfileDI.fundingSources]: [InvestorProfileFundingSources.businessIncome],
      [InvestorProfileDI.investmentGoals]: ['foo'],
      [InvestorProfileDI.riskTolerance]: 'aggressive',
    };
    /** @ts-expect-error enum vs string */
    trackInitializedSteps(tracker, data);
    expect(tracker).toHaveBeenCalledTimes(6);
    expect(tracker).toHaveBeenCalledWith('investor-profile:employment-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:income-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:net-worth-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:funding-sources-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:investment-goals-submit');
    expect(tracker).toHaveBeenCalledWith('investor-profile:risk-tolerance-submit');
  });
});
