export type UserAmlFormData = {
  aml: Aml;
};

export type Aml = {
  enhancedAml: boolean;
  ofac: boolean;
  pep: boolean;
  adverseMedia: boolean;
  hasOptionSelected?: boolean;
  adverseMediaList: {
    financial_crime: boolean;
    violent_crime: boolean;
    sexual_crime: boolean;
    cyber_crime: boolean;
    terrorism: boolean;
    fraud: boolean;
    narcotics: boolean;
    general_serious: boolean;
    general_minor: boolean;
  };
  matchingMethod: {
    kind: 'fuzzy' | 'exact';
    fuzzyLevel: 'fuzzy_low' | 'fuzzy_medium' | 'fuzzy_high';
    exactLevel: 'exact_name' | 'exact_name_and_dob_year';
  };
};
