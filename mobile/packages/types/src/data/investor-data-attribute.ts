export enum InvestorProfileAnnualIncome {
  le25k = 'le25k',
  gt25kLe50k = 'gt25k_le50k',
  gt50kLe100k = 'gt50k_le100k',
  gt100kLe200k = 'gt100k_le200k',
  gt200kLe300k = 'gt200k_le300k',
  gt300kLe500k = 'gt300k_le500k',
  gt500kLe1200k = 'gt500k_le1200k',
  gt1200k = 'gt1200k',
}

export enum InvestorProfileNetWorth {
  le50k = 'le50k',
  gt50kLe100k = 'gt50k_le100k',
  gt100kLe200k = 'gt100k_le200k',
  gt200kLe500k = 'gt200k_le500k',
  gt500kLe1m = 'gt500k_le1m',
  gt1mLe5m = 'gt1m_le5m',
  gt5m = 'gt5m',
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
}

export enum InvestorProfileFundingSources {
  employmentIncome = 'employment_income',
  investments = 'investments',
  inheritance = 'inheritance',
  businessIncome = 'business_income',
  savings = 'savings',
  family = 'family',
}
