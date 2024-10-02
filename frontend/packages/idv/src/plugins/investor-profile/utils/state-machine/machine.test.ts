import { InvestorProfileDI } from '@onefootprint/types';
import { interpret } from 'xstate';
import type { CreateInvestorProfileArgs } from './machine';
import createCollectInvestorProfileDataMachine from './machine';
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
    expect(state.context.vaultData).toEqual(employmentData);

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
