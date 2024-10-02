import { InvestorProfileDI } from '@onefootprint/types';
import isEqual from 'lodash/isEqual';
import omitBy from 'lodash/omitBy';

import { isObject, isStringValid } from '../../../utils/type-guards';
import type { MachineContext } from './state-machine/types';

export const omitNullAndUndefined = (obj: object) => omitBy(obj, value => value == null);

export const isMissingEmploymentData = ({ data }: MachineContext): boolean => {
  const employmentStatus = data?.[InvestorProfileDI.employmentStatus];
  const occupation = data?.[InvestorProfileDI.occupation];
  const employer = data?.[InvestorProfileDI.employer];

  if (!employmentStatus) return true;
  return employmentStatus === 'employed' && (!occupation || !employer);
};

export const isMissingIncomeData = ({ data }: MachineContext): boolean => {
  return !data?.[InvestorProfileDI.annualIncome];
};

export const isMissingNetWorthData = ({ data }: MachineContext): boolean => {
  return !data?.[InvestorProfileDI.netWorth];
};

export const isMissingFundingSources = ({ data }: MachineContext): boolean => {
  const sources = data?.[InvestorProfileDI.fundingSources];
  if (!sources || !Array.isArray(sources)) return true;
  return sources.length === 0;
};

export const isMissingInvestmentGoalsData = ({ data }: MachineContext): boolean => {
  const goals = data?.[InvestorProfileDI.investmentGoals];
  if (!goals || !Array.isArray(goals)) return true;
  return goals.length === 0;
};

export const isMissingRiskToleranceData = ({ data }: MachineContext): boolean => {
  return !data?.[InvestorProfileDI.riskTolerance];
};

export const isMissingDeclarationsData = (ctx: MachineContext): boolean => {
  const hasDeclarationsData = hasAnyDeclarationsData(ctx);
  const hasFileInContext = !!ctx.declarationFiles;
  if (hasDeclarationsData && ctx?.investorRequirement?.missingDocument === true && !hasFileInContext) {
    return true;
  }
  return false;
};

export const hasAnyDeclarationsData = ({ data }: MachineContext): boolean => {
  if (isStringValid(data?.[InvestorProfileDI.brokerageFirmEmployer])) {
    return true;
  }
  if (isStringValid(data?.[InvestorProfileDI.politicalOrganization])) {
    return true;
  }

  const familyMemberNamesValue = data?.[InvestorProfileDI.familyMemberNames];
  if (
    Array.isArray(familyMemberNamesValue) &&
    familyMemberNamesValue.length > 0 &&
    familyMemberNamesValue.every(isStringValid)
  ) {
    return true;
  }

  const seniorExecutiveSymbolsValue = data?.[InvestorProfileDI.seniorExecutiveSymbols];
  if (
    Array.isArray(seniorExecutiveSymbolsValue) &&
    seniorExecutiveSymbolsValue.length > 0 &&
    seniorExecutiveSymbolsValue.every(isStringValid)
  ) {
    return true;
  }

  return false;
};

/** Triggers track actions for initial missing data in the investor profile. */
export const trackInitializedSteps = (tracker: (action: string) => void, data: MachineContext['data'] = {}): void => {
  const flowOrder = [
    { isMissing: isMissingEmploymentData, action: 'investor-profile:employment-submit' },
    { isMissing: isMissingIncomeData, action: 'investor-profile:income-submit' },
    { isMissing: isMissingNetWorthData, action: 'investor-profile:net-worth-submit' },
    { isMissing: isMissingFundingSources, action: 'investor-profile:funding-sources-submit' },
    { isMissing: isMissingInvestmentGoalsData, action: 'investor-profile:investment-goals-submit' },
    { isMissing: isMissingRiskToleranceData, action: 'investor-profile:risk-tolerance-submit' },
  ];

  for (const { isMissing, action } of flowOrder) {
    if (!isMissing({ data })) {
      tracker(action);
    } else {
      break;
    }
  }
};

export const omitEqualData = <T extends MachineContext['data']>(vaultData: T | undefined | null, payload: T): T => {
  const output = {} as T;

  if (!isObject(vaultData)) return payload;

  for (const key in payload) {
    if (isObject(payload[key]) || Array.isArray(payload[key])) {
      if (!isEqual(payload[key], vaultData[key])) {
        output[key] = payload[key];
      }
    } else if (payload[key] !== vaultData[key]) {
      output[key] = payload[key];
    }
  }

  return output;
};
