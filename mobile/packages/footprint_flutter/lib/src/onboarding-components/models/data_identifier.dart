// Equivalent to "frontend/packages/types/src/data/di.ts"
// We don't have separate enums for KYC, KYB, investor profile, and document collection
// We are putting all of them in one enum
// This is because Dart does not have union types
// We also only have IdDi, BusinessDi, and InvestorDi
// Since we don't support collecting documents and card data in the onboarding components SDK
// This should serve the purpose for now
enum DataIdentifier {
  investorEmploymentStatus("investor_profile.employment_status"),
  investorOccupation("investor_profile.occupation"),
  investorEmployer("investor_profile.employer"),
  investorAnnualIncome("investor_profile.annual_income"),
  investorNetWorth("investor_profile.net_worth"),
  investorInvestmentGoals("investor_profile.investment_goals"),
  investorRiskTolerance("investor_profile.risk_tolerance"),
  investorDeclarations("investor_profile.declarations"),
  investorSeniorExecutiveSymbols("investor_profile.senior_executive_symbols"),
  investorFamilyMemberNames("investor_profile.family_member_names"),
  investorPoliticalOrganization("investor_profile.political_organization"),
  investorBrokerageFirmEmployer("investor_profile.brokerage_firm_employer"),
  investorFundingSources("investor_profile.funding_sources"),
  idFirstName("id.first_name"),
  idMiddleName("id.middle_name"),
  idLastName("id.last_name"),
  idEmail("id.email"),
  idPhoneNumber("id.phone_number"),
  idDob("id.dob"),
  idSsn9("id.ssn9"),
  idSsn4("id.ssn4"),
  idAddressLine1("id.address_line1"),
  idAddressLine2("id.address_line2"),
  idCity("id.city"),
  idState("id.state"),
  idCountry("id.country"),
  idZip("id.zip"),
  idNationality("id.nationality"),
  idUsLegalStatus("id.us_legal_status"),
  idVisaKind("id.visa_kind"),
  idVisaExpirationDate("id.visa_expiration_date"),
  idCitizenships("id.citizenships"),
  idUsTaxId("id.us_tax_id"),
  idItin("id.itin"),
  custom("custom.");

  final String value;
  const DataIdentifier(this.value);

  static DataIdentifier? fromValue(String value) {
    switch (value) {
      case "investor_profile.employment_status":
        return DataIdentifier.investorEmploymentStatus;
      case "investor_profile.occupation":
        return DataIdentifier.investorOccupation;
      case "investor_profile.employer":
        return DataIdentifier.investorEmployer;
      case "investor_profile.annual_income":
        return DataIdentifier.investorAnnualIncome;
      case "investor_profile.net_worth":
        return DataIdentifier.investorNetWorth;
      case "investor_profile.investment_goals":
        return DataIdentifier.investorInvestmentGoals;
      case "investor_profile.risk_tolerance":
        return DataIdentifier.investorRiskTolerance;
      case "investor_profile.declarations":
        return DataIdentifier.investorDeclarations;
      case "investor_profile.senior_executive_symbols":
        return DataIdentifier.investorSeniorExecutiveSymbols;
      case "investor_profile.family_member_names":
        return DataIdentifier.investorFamilyMemberNames;
      case "investor_profile.political_organization":
        return DataIdentifier.investorPoliticalOrganization;
      case "investor_profile.brokerage_firm_employer":
        return DataIdentifier.investorBrokerageFirmEmployer;
      case "investor_profile.funding_sources":
        return DataIdentifier.investorFundingSources;
      case "id.first_name":
        return DataIdentifier.idFirstName;
      case "id.middle_name":
        return DataIdentifier.idMiddleName;
      case "id.last_name":
        return DataIdentifier.idLastName;
      case "id.email":
        return DataIdentifier.idEmail;
      case "id.phone_number":
        return DataIdentifier.idPhoneNumber;
      case "id.dob":
        return DataIdentifier.idDob;
      case "id.ssn9":
        return DataIdentifier.idSsn9;
      case "id.ssn4":
        return DataIdentifier.idSsn4;
      case "id.address_line1":
        return DataIdentifier.idAddressLine1;
      case "id.address_line2":
        return DataIdentifier.idAddressLine2;
      case "id.city":
        return DataIdentifier.idCity;
      case "id.state":
        return DataIdentifier.idState;
      case "id.country":
        return DataIdentifier.idCountry;
      case "id.zip":
        return DataIdentifier.idZip;
      case "id.nationality":
        return DataIdentifier.idNationality;
      case "id.us_legal_status":
        return DataIdentifier.idUsLegalStatus;
      case "id.visa_kind":
        return DataIdentifier.idVisaKind;
      case "id.visa_expiration_date":
        return DataIdentifier.idVisaExpirationDate;
      case "id.citizenships":
        return DataIdentifier.idCitizenships;
      case "id.us_tax_id":
        return DataIdentifier.idUsTaxId;
      case "id.itin":
        return DataIdentifier.idItin;
      case "custom":
        return DataIdentifier.custom;
      default:
        return null;
    }
  }

  @override
  String toString() {
    return value;
  }
}
