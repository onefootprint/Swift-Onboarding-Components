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
}