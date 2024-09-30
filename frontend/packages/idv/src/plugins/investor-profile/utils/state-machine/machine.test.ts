import { InvestorProfileDI, InvestorProfileFundingSources } from '@onefootprint/types';
import { interpret } from 'xstate';
import type { CreateInvestorProfileArgs } from './machine';
import createCollectInvestorProfileDataMachine, {
  hasAnyDeclarationsData,
  isMissingEmploymentData,
  isMissingFundingSources,
  isMissingIncomeData,
  isMissingInvestmentGoalsData,
  isMissingNetWorthData,
  isMissingRiskToleranceData,
  trackInitializedSteps,
} from './machine';
import type { DeclarationData } from './types';

const createMachine = ({ device, authToken, showTransition }: CreateInvestorProfileArgs) => {
  const machine = interpret(createCollectInvestorProfileDataMachine({ device, authToken, showTransition }));
  machine.start();
  return machine;
};

const device = {
  browser: 'Mobile Safari',
  hasSupportForWebauthn: true,
  osName: 'iOS',
  type: 'mobile',
};

const fundingSourcesData = { [InvestorProfileDI.fundingSources]: ['business_income'] };
const incomeData = { [InvestorProfileDI.annualIncome]: 'le25k' };
const investmentGoalsData = { [InvestorProfileDI.investmentGoals]: ['foo'] };
const netWorthData = { [InvestorProfileDI.netWorth]: 'le50k' };
const riskToleranceData = { [InvestorProfileDI.riskTolerance]: 'aggressive' };
const declarationsData = {
  'investor_profile.brokerage_firm_employer': undefined,
  'investor_profile.family_member_names': undefined,
  'investor_profile.political_organization': undefined,
  'investor_profile.senior_executive_symbols': undefined,
};
const employmentData = {
  [InvestorProfileDI.employmentStatus]: 'employed',
  [InvestorProfileDI.occupation]: 'occupation',
  [InvestorProfileDI.employer]: 'employer',
};

describe('createCollectInvestorProfileDataMachine', () => {
  const initialContext = {
    authToken: 'tok_init',
    data: {},
    device: device,
    showTransition: true,
  };

  it('should bootstrap employment', () => {
    const machine = createMachine({ authToken: 'tok_init', device, showTransition: true });
    let { state } = machine;

    expect(state.value).toEqual('init');

    state = machine.send({ type: 'initDone', payload: employmentData });
    expect(state.value).toEqual('income');

    expect(state.done).toEqual(false);
  });

  it('should bootstrap employment, income', () => {
    const machine = createMachine({ authToken: 'tok_init', device, showTransition: true });
    let { state } = machine;

    expect(state.value).toEqual('init');

    /** @ts-expect-error enum vs string */
    state = machine.send({ type: 'initDone', payload: { ...employmentData, ...incomeData } });
    expect(state.value).toEqual('netWorth');

    expect(state.done).toEqual(false);
  });

  it('should bootstrap employment, income, netWorth', () => {
    const machine = createMachine({ authToken: 'tok_init', device, showTransition: true });
    let { state } = machine;

    expect(state.value).toEqual('init');

    state = machine.send({
      type: 'initDone' /** @ts-expect-error enum vs string */,
      payload: {
        ...employmentData,
        ...incomeData,
        ...netWorthData,
      },
    });
    expect(state.value).toEqual('fundingSources');

    expect(state.done).toEqual(false);
  });

  it('should bootstrap employment, income, netWorth, fundingSources', () => {
    const machine = createMachine({ authToken: 'tok_init', device, showTransition: true });
    let { state } = machine;

    expect(state.value).toEqual('init');

    state = machine.send({
      type: 'initDone' /** @ts-expect-error enum vs string */,
      payload: {
        ...employmentData,
        ...incomeData,
        ...netWorthData,
        ...fundingSourcesData,
      },
    });
    expect(state.value).toEqual('investmentGoals');

    expect(state.done).toEqual(false);
  });

  it('should bootstrap employment, income, netWorth, fundingSources, investmentGoals', () => {
    const machine = createMachine({ authToken: 'tok_init', device, showTransition: true });
    let { state } = machine;

    expect(state.value).toEqual('init');

    state = machine.send({
      type: 'initDone' /** @ts-expect-error enum vs string */,
      payload: {
        ...employmentData,
        ...incomeData,
        ...netWorthData,
        ...fundingSourcesData,
        ...investmentGoalsData,
      },
    });
    expect(state.value).toEqual('riskTolerance');

    expect(state.done).toEqual(false);
  });

  it('should bootstrap employment, income, netWorth, fundingSources, investmentGoals, riskTolerance', () => {
    const machine = createMachine({ authToken: 'tok_init', device, showTransition: true });
    let { state } = machine;

    expect(state.value).toEqual('init');

    state = machine.send({
      type: 'initDone' /** @ts-expect-error enum vs string */,
      payload: {
        ...employmentData,
        ...incomeData,
        ...netWorthData,
        ...fundingSourcesData,
        ...investmentGoalsData,
        ...riskToleranceData,
      },
    });
    expect(state.value).toEqual('declarations');

    state = machine.send({
      type: 'declarationsSubmitted',
      payload: { data: declarationsData as DeclarationData },
    });
    expect(state.value).toEqual('confirm');

    expect(state.done).toEqual(false);
  });

  it('should go step by step', () => {
    const machine = createMachine({ authToken: 'tok_init', device, showTransition: true });
    let { state } = machine;

    expect(state.value).toEqual('init');
    expect(state.context).toEqual(initialContext);

    state = machine.send({ type: 'initFailed' });
    expect(state.value).toEqual('employment');

    state = machine.send({ type: 'employmentSubmitted', payload: employmentData });
    expect(state.value).toEqual('income');

    /** @ts-expect-error enum vs string */
    state = machine.send({ type: 'incomeSubmitted', payload: incomeData });
    expect(state.value).toEqual('netWorth');

    /** @ts-expect-error enum vs string */
    state = machine.send({ type: 'netWorthSubmitted', payload: netWorthData });
    expect(state.value).toEqual('fundingSources');

    /** @ts-expect-error enum vs string */
    state = machine.send({ type: 'fundingSourcesSubmitted', payload: fundingSourcesData });
    expect(state.value).toEqual('investmentGoals');

    /** @ts-expect-error enum vs string */
    state = machine.send({ type: 'investmentGoalsSubmitted', payload: investmentGoalsData });
    expect(state.value).toEqual('riskTolerance');

    /** @ts-expect-error enum vs string */
    state = machine.send({ type: 'riskToleranceSubmitted', payload: riskToleranceData });
    expect(state.value).toEqual('declarations');

    state = machine.send({
      type: 'declarationsSubmitted',
      payload: { data: declarationsData as DeclarationData },
    });
    expect(state.value).toEqual('confirm');

    /** Go back 2 pages/screens */
    state = machine.send({ type: 'navigatedToPrevPage' });
    expect(state.value).toEqual('declarations');
    state = machine.send({ type: 'navigatedToPrevPage' });
    expect(state.value).toEqual('riskTolerance');

    /** @ts-expect-error enum vs string */
    state = machine.send({ type: 'riskToleranceSubmitted', payload: riskToleranceData });
    /** declarations was skipped */
    expect(state.value).toEqual('confirm');

    expect(state.done).toEqual(false);
  });
});

describe('isMissingEmploymentData', () => {
  it('should return true if employment status is undefined', () => {
    const result = isMissingEmploymentData({ data: { [InvestorProfileDI.employmentStatus]: undefined } });
    expect(result).toBe(true);
  });

  it('should return true if employment status is empty', () => {
    const result = isMissingEmploymentData({ data: { [InvestorProfileDI.employmentStatus]: '' } });
    expect(result).toBe(true);
  });

  it('should return false if employment status is not empty and not "employed"', () => {
    const result = isMissingEmploymentData({ data: { [InvestorProfileDI.employmentStatus]: 'unemployed' } });
    expect(result).toBe(false);
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

describe('hasAnyDeclarationsData', () => {
  it('should return false for empty data object', () => {
    const result = hasAnyDeclarationsData({ data: {} });
    expect(result).toBe(false);
  });

  it('should validate brokerage firm employer', () => {
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.brokerageFirmEmployer]: 'employer' } })).toBe(true);
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.brokerageFirmEmployer]: '' } })).toBe(false);
  });

  it('should validate political organization', () => {
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.politicalOrganization]: 'organization' } })).toBe(true);
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.politicalOrganization]: '' } })).toBe(false);
  });

  it('should validate family member names array', () => {
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.familyMemberNames]: ['name1'] } })).toBe(true);
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.familyMemberNames]: [''] } })).toBe(false);
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.familyMemberNames]: [] } })).toBe(false);
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.familyMemberNames]: undefined } })).toBe(false);
  });

  it('should return true for data object with non-empty senior executive symbols array', () => {
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.seniorExecutiveSymbols]: ['symbol1'] } })).toBe(true);
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.seniorExecutiveSymbols]: [''] } })).toBe(false);
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.seniorExecutiveSymbols]: [] } })).toBe(false);
    expect(hasAnyDeclarationsData({ data: { [InvestorProfileDI.seniorExecutiveSymbols]: undefined } })).toBe(false);
  });
});
