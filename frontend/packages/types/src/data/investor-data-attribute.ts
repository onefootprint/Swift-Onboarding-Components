export enum InvestorProfileDataAttribute {
  employmentStatus = 'investor_profile.employment_status',
  occupation = 'investor_profile.occupation',
  employedByBrokerage = 'investor_profile.employed_by_brokerage',
  employedByBrokerageFirm = 'investor_profile.brokerage_firm_employer',
  annualIncome = 'investor_profile.annual_income',
  netWorth = 'investor_profile.net_worth',
  investmentGoals = 'investor_profile.investment_goals',
  riskTolerance = 'investor_profile.risk_tolerance',
  declarations = 'investor_profile.declarations',
  complianceLetter = 'investor_profile.compliance_letter',
}

export enum InvestorProfileEmploymentStatus {
  employed = 'employed',
  unemployed = 'unemployed',
}

export enum InvestorProfileEmployedByBrokerage {
  yes = 'yes',
  no = 'no',
}

export enum InvestorProfileAnnualIncome {
  tt50k = 'lt_50k',
  s50kTo100k = 's50k_to_100k',
  s100kTo250k = 's100k_to_250k',
  s250kTo500k = 's250k_to_500k',
  gt500k = 'Gt_500k',
}

export enum InvestorProfileNetWorth {
  tt50k = 'lt_50k',
  s50kTo100k = 's50k_to_100k',
  s100kTo250k = 's100k_to_250k',
  s250kTo500k = 's250k_to_500k',
  S500kTo1m = 's500k_to_1m',
  Gt1m = 'gt_1m',
}

export enum InvestorProfileInvestmentGoal {
  growLongTermWealth = 'grow_long_term_wealth',
  saveForRetirement = 'save_for_retirement',
  supportLovedOnes = 'support_loved_ones',
  buyAHome = 'buy_a_home',
  payOffDebt = 'pay_off_debt',
  startMyOwnBusiness = 'start_my_own_business',
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
}
