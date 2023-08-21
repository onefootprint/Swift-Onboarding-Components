export enum InvestorProfileAnnualIncome {
  lt50k = 'lt50k',
  s50kTo100k = 's50k_to100k',
  s100kTo250k = 's100k_to250k',
  s250kTo500k = 's250k_to500k',
  gt500k = 'gt500k',
}

export enum InvestorProfileNetWorth {
  lt50k = 'lt50k',
  s50kTo100k = 's50k_to100k',
  s100kTo250k = 's100k_to250k',
  s250kTo500k = 's250k_to500k',
  S500kTo1m = 's500k_to1m',
  gt1m = 'gt1m',
}

export enum InvestorProfileInvestmentGoal {
  growth = 'growth',
  income = 'income',
  preserveCapital = 'preserve_capital',
  speculation = 'speculation',
  diversification = 'diversification',
  other = 'other',
}

export enum InvestorProfileRiskTolerance {
  conservative = 'conservative',
  moderate = 'moderate',
  aggressive = 'aggressive',
}

export enum InvestorProfileDeclaration {
  affiliatedWithUsBroker = 'affiliated_with_us_broker',
  seniorExecutive = 'senior_executive',
  seniorPoliticalFigure = 'senior_political_figure',
  familyOfPoliticalFigure = 'family_of_political_figure',
  none = 'none',
}
