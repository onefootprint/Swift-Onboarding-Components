import Foundation

public struct VaultData {
    // VaultIdProps
    public let idAddressLine1: String?
    public let idAddressLine2: String?
    public let idCitizenships: [String]?
    public let idCity: String?
    public let idCountry: String?
    public let idDob: String?
    public let idDriversLicenseNumber: String?
    public let idDriversLicenseState: String?
    public let idEmail: String?
    public let idFirstName: String?
    public let idItin: String?
    public let idLastName: String?
    public let idMiddleName: String?
    public let idNationality: String?
    public let idPhoneNumber: String?
    public let idSsn4: String?
    public let idSsn9: String?
    public let idState: String?
    public let idUsLegalStatus: String?
    public let idUsTaxId: String?
    public let idVisaExpirationDate: String?
    public let idVisaKind: String?
    public let idZip: String?
    
    // VaultInvestorProps
    public let investorProfileEmploymentStatus: Components.Schemas.VaultInvestorProps.investor_profile_period_employment_statusPayload?
    public let investorProfileOccupation: String?
    public let investorProfileEmployer: String?
    public let investorProfileAnnualIncome: Components.Schemas.VaultInvestorProps.investor_profile_period_annual_incomePayload?
    public let investorProfileNetWorth: Components.Schemas.VaultInvestorProps.investor_profile_period_net_worthPayload?
    public let investorProfileFundingSources: Components.Schemas.VaultInvestorProps.investor_profile_period_funding_sourcesPayload?
    public let investorProfileInvestmentGoals: Components.Schemas.VaultInvestorProps.investor_profile_period_investment_goalsPayload?
    public let investorProfileRiskTolerance: Components.Schemas.VaultInvestorProps.investor_profile_period_risk_tolerancePayload?
    public let investorProfileDeclarations: Components.Schemas.VaultInvestorProps.investor_profile_period_declarationsPayload?
    public let investorProfileSeniorExecutiveSymbols: [String]?
    public let investorProfileFamilyMemberNames: [String]?
    public let investorProfilePoliticalOrganization: String?
    public let investorProfileBrokerageFirmEmployer: String?
    
    // VaultCustomProps
    public let customProperties: [String: String]?

    public init(
        idAddressLine1: String? = nil,
        idAddressLine2: String? = nil,
        idCitizenships: [String]? = nil,
        idCity: String? = nil,
        idCountry: String? = nil,
        idDob: String? = nil,
        idDriversLicenseNumber: String? = nil,
        idDriversLicenseState: String? = nil,
        idEmail: String? = nil,
        idFirstName: String? = nil,
        idItin: String? = nil,
        idLastName: String? = nil,
        idMiddleName: String? = nil,
        idNationality: String? = nil,
        idPhoneNumber: String? = nil,
        idSsn4: String? = nil,
        idSsn9: String? = nil,
        idState: String? = nil,
        idUsLegalStatus: String? = nil,
        idUsTaxId: String? = nil,
        idVisaExpirationDate: String? = nil,
        idVisaKind: String? = nil,
        idZip: String? = nil,
        investorProfileEmploymentStatus: Components.Schemas.VaultInvestorProps.investor_profile_period_employment_statusPayload? = nil,
        investorProfileOccupation: String? = nil,
        investorProfileEmployer: String? = nil,
        investorProfileAnnualIncome: Components.Schemas.VaultInvestorProps.investor_profile_period_annual_incomePayload? = nil,
        investorProfileNetWorth: Components.Schemas.VaultInvestorProps.investor_profile_period_net_worthPayload? = nil,
        investorProfileFundingSources: Components.Schemas.VaultInvestorProps.investor_profile_period_funding_sourcesPayload? = nil,
        investorProfileInvestmentGoals: Components.Schemas.VaultInvestorProps.investor_profile_period_investment_goalsPayload? = nil,
        investorProfileRiskTolerance: Components.Schemas.VaultInvestorProps.investor_profile_period_risk_tolerancePayload? = nil,
        investorProfileDeclarations: Components.Schemas.VaultInvestorProps.investor_profile_period_declarationsPayload? = nil,
        investorProfileSeniorExecutiveSymbols: [String]? = nil,
        investorProfileFamilyMemberNames: [String]? = nil,
        investorProfilePoliticalOrganization: String? = nil,
        investorProfileBrokerageFirmEmployer: String? = nil,
        customProperties: [String: String]? = nil
    ) {
        self.idAddressLine1 = idAddressLine1.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idAddressLine2 = idAddressLine2.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idCitizenships = idCitizenships?.isEmpty ?? true ? nil : idCitizenships
        self.idCity = idCity.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idCountry = idCountry.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idDob = idDob.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idDriversLicenseNumber = idDriversLicenseNumber.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idDriversLicenseState = idDriversLicenseState.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idEmail = idEmail.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idFirstName = idFirstName.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idItin = idItin.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idLastName = idLastName.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idMiddleName = idMiddleName.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idNationality = idNationality.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idPhoneNumber = idPhoneNumber.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idSsn4 = idSsn4.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idSsn9 = idSsn9.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idState = idState.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idUsLegalStatus = idUsLegalStatus.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idUsTaxId = idUsTaxId.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idVisaExpirationDate = idVisaExpirationDate.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idVisaKind = idVisaKind.map { $0.isEmpty ? nil : $0 } ?? nil
        self.idZip = idZip.map { $0.isEmpty ? nil : $0 } ?? nil
        self.investorProfileEmploymentStatus = investorProfileEmploymentStatus
        self.investorProfileOccupation = investorProfileOccupation.map { $0.isEmpty ? nil : $0 } ?? nil
        self.investorProfileEmployer = investorProfileEmployer.map { $0.isEmpty ? nil : $0 } ?? nil
        self.investorProfileAnnualIncome = investorProfileAnnualIncome
        self.investorProfileNetWorth = investorProfileNetWorth
        self.investorProfileFundingSources = investorProfileFundingSources
        self.investorProfileInvestmentGoals = investorProfileInvestmentGoals
        self.investorProfileRiskTolerance = investorProfileRiskTolerance
        self.investorProfileDeclarations = investorProfileDeclarations
        self.investorProfileSeniorExecutiveSymbols = investorProfileSeniorExecutiveSymbols?.isEmpty ?? true ? nil : investorProfileSeniorExecutiveSymbols
        self.investorProfileFamilyMemberNames = investorProfileFamilyMemberNames?.isEmpty ?? true ? nil : investorProfileFamilyMemberNames
        self.investorProfilePoliticalOrganization = investorProfilePoliticalOrganization.map { $0.isEmpty ? nil : $0 } ?? nil
        self.investorProfileBrokerageFirmEmployer = investorProfileBrokerageFirmEmployer.map { $0.isEmpty ? nil : $0 } ?? nil
        self.customProperties = customProperties?.isEmpty ?? true ? nil : customProperties
    }
    
    public static func fromRawUserDataRequest(_ rawUserData: Components.Schemas.RawUserDataRequest) -> VaultData {      
        return VaultData(
            idAddressLine1: rawUserData.value1?.id_period_address_line1,
            idAddressLine2: rawUserData.value1?.id_period_address_line2,
            idCitizenships: rawUserData.value1?.id_period_citizenships,
            idCity: rawUserData.value1?.id_period_city,
            idCountry: rawUserData.value1?.id_period_country,
            idDob: rawUserData.value1?.id_period_dob,
            idDriversLicenseNumber: rawUserData.value1?.id_period_drivers_license_number,
            idDriversLicenseState: rawUserData.value1?.id_period_drivers_license_state,
            idEmail: rawUserData.value1?.id_period_email,
            idFirstName: rawUserData.value1?.id_period_first_name,
            idItin: rawUserData.value1?.id_period_itin,
            idLastName: rawUserData.value1?.id_period_last_name,
            idMiddleName: rawUserData.value1?.id_period_middle_name,
            idNationality: rawUserData.value1?.id_period_nationality,
            idPhoneNumber: rawUserData.value1?.id_period_phone_number,
            idSsn4: rawUserData.value1?.id_period_ssn4,
            idSsn9: rawUserData.value1?.id_period_ssn9,
            idState: rawUserData.value1?.id_period_state,
            idUsLegalStatus: rawUserData.value1?.id_period_us_legal_status,
            idUsTaxId: rawUserData.value1?.id_period_us_tax_id,
            idVisaExpirationDate: rawUserData.value1?.id_period_visa_expiration_date,
            idVisaKind: rawUserData.value1?.id_period_visa_kind,
            idZip: rawUserData.value1?.id_period_zip,
            investorProfileEmploymentStatus: rawUserData.value2?.investor_profile_period_employment_status,
            investorProfileOccupation: rawUserData.value2?.investor_profile_period_occupation,
            investorProfileEmployer: rawUserData.value2?.investor_profile_period_employer,
            investorProfileAnnualIncome: rawUserData.value2?.investor_profile_period_annual_income,
            investorProfileNetWorth: rawUserData.value2?.investor_profile_period_net_worth,
            investorProfileFundingSources: rawUserData.value2?.investor_profile_period_funding_sources,
            investorProfileInvestmentGoals: rawUserData.value2?.investor_profile_period_investment_goals,
            investorProfileRiskTolerance: rawUserData.value2?.investor_profile_period_risk_tolerance,
            investorProfileDeclarations: rawUserData.value2?.investor_profile_period_declarations,
            investorProfileSeniorExecutiveSymbols: rawUserData.value2?.investor_profile_period_senior_executive_symbols,
            investorProfileFamilyMemberNames: rawUserData.value2?.investor_profile_period_family_member_names,
            investorProfilePoliticalOrganization: rawUserData.value2?.investor_profile_period_political_organization,
            investorProfileBrokerageFirmEmployer: rawUserData.value2?.investor_profile_period_brokerage_firm_employer          
        )
    }
}
