import Foundation

public struct Fields {
    public var missing: [VaultDI] = []
    public var optional: [VaultDI] = []
    public var collected: [VaultDI] = []
}

public struct Requirements {
    public var all: [Requirement] = []
    public var isCompleted: Bool = false
    public var isMissing: Bool = false
    public var missing: [Requirement] = []
}

public struct RequirementAttributes {
    public let fields: Fields
    public let requirements: Requirements
    
    public static func getRequirements(from onboardingStatus: OnboardingStatusResponse) -> RequirementAttributes {
        var fields = Fields()
        var requirements = Requirements()
        
        requirements.all = onboardingStatus.allRequirements
        requirements.missing = onboardingStatus.allRequirements.filter {
            switch $0 {
            case .typeAuthorizeRequirement(let authorizeReq):
                return authorizeReq.isMet == false
            case .typeCollectDataRequirement(let dataReq):
                return dataReq.isMet == false
            case .typeCollectInvestorProfileRequirement(let investorReq):
                return investorReq.isMet == false
            case .typeDocumentRequirement(let docReq):
                return docReq.isMet == false
            case .typeProcessRequirement(let processReq):
                return processReq.isMet == false
            case .typeRegisterAuthMethodRequirement(let authMethodReq):
                return authMethodReq.isMet == false
            case .typeRegisterPasskeyRequirement(let passkeyReq):
                return passkeyReq.isMet == false
            }
        }
        requirements.isCompleted = requirements.missing.isEmpty
        requirements.isMissing = !requirements.isCompleted
        
        let (collectDataRequirement, investorProfileRequirement): (CollectDataRequirement?, CollectInvestorProfileRequirement?) = onboardingStatus.allRequirements.reduce(into: (nil, nil)) { result, requirement in
            switch requirement {
            case let .typeCollectDataRequirement(collectDataReq):
                result.0 = collectDataReq
            case let .typeCollectInvestorProfileRequirement(investorProfileReq):
                result.1 = investorProfileReq
            default:
                break
            }
        }
                
        let optionalAttributes = collectDataRequirement?.optionalAttributes.flatMap { $0 }.flatMap { attribute in
            return CdoToAllDisMap[attribute.rawValue] ?? []
        } ?? []

        let collectDataPopulated = collectDataRequirement?.populatedAttributes ?? []
        let investorProfilePopulated = investorProfileRequirement?.populatedAttributes ?? []
        let allPopulated = collectDataPopulated.map { CollectedAttributes(rawValue: $0.rawValue)! } +
            investorProfilePopulated.map { CollectedAttributes(rawValue: $0.rawValue)! }
        let populatedAttributes = allPopulated.flatMap { attribute in
            return CdoToAllDisMap[attribute.rawValue] ?? []
        }
        
        let collectDataMissing = collectDataRequirement?.missingAttributes ?? []
        let investorProfileMissing = investorProfileRequirement?.missingAttributes ?? []
        let allMissing = collectDataMissing.map { CollectedAttributes(rawValue: $0.rawValue)! } +
            investorProfileMissing.map { CollectedAttributes(rawValue: $0.rawValue)! }
        let missingAttributes = allMissing.flatMap { attribute in
            return CdoToAllDisMap[attribute.rawValue] ?? []
        }
        
        let filteredMissingAttributes = missingAttributes.filter { attr in
            if attr.rawValue == "id.address_line2" || attr.rawValue == "id.middle_name" {
                fields.optional.append(attr)
                return false
            }
            return true
        }
        
        fields.optional.append(contentsOf: optionalAttributes)
        fields.collected.append(contentsOf: populatedAttributes)
        fields.missing.append(contentsOf: filteredMissingAttributes)
        
        return RequirementAttributes(
            fields: fields,
            requirements: requirements
        )
    }
}


let CdoToAllDisMap: [String: [VaultDI]] = [
    CollectedAttributes.name.rawValue: [
        VaultDI(rawValue: VaultData.CodingKeys.idFirstName.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idMiddleName.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idLastName.rawValue)!
    ],
    CollectedAttributes.dob.rawValue: [VaultDI(rawValue: VaultData.CodingKeys.idDob.rawValue)!],
    CollectedAttributes.ssn4.rawValue: [VaultDI(rawValue: VaultData.CodingKeys.idSsn4.rawValue)!],
    CollectedAttributes.ssn9.rawValue: [VaultDI(rawValue: VaultData.CodingKeys.idSsn9.rawValue)!],
    CollectedAttributes.usTaxId.rawValue: [VaultDI(rawValue: VaultData.CodingKeys.idUsTaxId.rawValue)!],
    CollectedAttributes.fullAddress.rawValue: [
        VaultDI(rawValue: VaultData.CodingKeys.idAddressLine1.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idAddressLine2.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idCity.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idState.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idZip.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idCountry.rawValue)!
    ],
    CollectedAttributes.email.rawValue: [VaultDI(rawValue: VaultData.CodingKeys.idEmail.rawValue)!],
    CollectedAttributes.phoneNumber.rawValue: [VaultDI(rawValue: VaultData.CodingKeys.idPhoneNumber.rawValue)!],
    CollectedAttributes.nationality.rawValue: [VaultDI(rawValue: VaultData.CodingKeys.idNationality.rawValue)!],
    CollectedAttributes.usLegalStatus.rawValue: [
        VaultDI(rawValue: VaultData.CodingKeys.idUsLegalStatus.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idVisaKind.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idVisaExpirationDate.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idCitizenships.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.idNationality.rawValue)!
    ],
    CollectedAttributes.investorProfile.rawValue: [
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileEmploymentStatus.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileOccupation.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileEmployer.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileAnnualIncome.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileNetWorth.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileInvestmentGoals.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileRiskTolerance.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileDeclarations.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileBrokerageFirmEmployer.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileSeniorExecutiveSymbols.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileFamilyMemberNames.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfilePoliticalOrganization.rawValue)!,
        VaultDI(rawValue: VaultData.CodingKeys.investorProfileFundingSources.rawValue)!
    ]
]
