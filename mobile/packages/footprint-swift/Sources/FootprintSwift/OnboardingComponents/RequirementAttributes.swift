import Foundation

public struct Fields {
    public var missing: [Components.Schemas.VaultDI] = []
    public var optional: [Components.Schemas.VaultDI] = []
    public var collected: [Components.Schemas.VaultDI] = []
}

public struct Requirements {
    public var all: [Components.Schemas.Requirement] = []
    public var isCompleted: Bool = false
    public var isMissing: Bool = false
    public var missing: [Components.Schemas.Requirement] = []
}

public struct RequirementAttributes {
    public let fields: Fields
    public let requirements: Requirements
    
    public static func getRequirements(from onboardingStatus: Components.Schemas.OnboardingStatusResponse) -> RequirementAttributes {
        var fields = Fields()
        var requirements = Requirements()

        requirements.all = onboardingStatus.all_requirements
        requirements.missing = onboardingStatus.all_requirements.filter {
            $0.value1?.is_met == false ||
            $0.value2?.is_met == false || 
            $0.value3?.is_met == false || 
            $0.value4?.is_met == false || 
            $0.value5?.is_met == false || 
            $0.value6?.is_met == false || 
            $0.value7?.is_met == false
        }
        requirements.isCompleted = requirements.missing.isEmpty
        requirements.isMissing = !requirements.isCompleted

        let collectDataRequirement = onboardingStatus.all_requirements.first(where: { requirement in
            requirement.value1?.kind == .collect_data
        })
        
        if let collectDataRequirement = collectDataRequirement?.value1 {
            let optionalAttributes = collectDataRequirement.optional_attributes.flatMap { attribute in
                if let rawValue = attribute.value1?.rawValue {
                    return CdoToAllDisMap[rawValue] ?? []
                }
                return []
            }
            let populatedAttributes = collectDataRequirement.populated_attributes.flatMap { attribute in
                if let rawValue = attribute.value1?.rawValue {
                    return CdoToAllDisMap[rawValue] ?? []
                }
                return []
            }
            let missingAttributes = collectDataRequirement.missing_attributes.flatMap { attribute in
                if let rawValue = attribute.value1?.rawValue {
                    return CdoToAllDisMap[rawValue] ?? []
                }
                return []
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
        }

        return RequirementAttributes(
            fields: fields,
            requirements: requirements
        )
    }     
}

let CdoToAllDisMap: [String: [Components.Schemas.VaultDI]] = [
    Components.Schemas.CollectedKycAttribute.name.rawValue: [
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_first_name.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_middle_name.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_last_name.rawValue)!
    ],
    Components.Schemas.CollectedKycAttribute.dob.rawValue: [Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_dob.rawValue)!],
    Components.Schemas.CollectedKycAttribute.ssn4.rawValue: [Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_ssn4.rawValue)!],
    Components.Schemas.CollectedKycAttribute.ssn9.rawValue: [Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_ssn9.rawValue)!],
    Components.Schemas.CollectedKycAttribute.us_tax_id.rawValue: [Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_us_tax_id.rawValue)!],
    Components.Schemas.CollectedKycAttribute.full_address.rawValue: [
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_address_line1.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_address_line2.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_city.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_state.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_zip.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_country.rawValue)!
    ],
    Components.Schemas.CollectedKycAttribute.email.rawValue: [Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_email.rawValue)!],
    Components.Schemas.CollectedKycAttribute.phone_number.rawValue: [Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_phone_number.rawValue)!],
    Components.Schemas.CollectedKycAttribute.nationality.rawValue: [Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_nationality.rawValue)!],
    Components.Schemas.CollectedKycAttribute.us_legal_status.rawValue: [
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_us_legal_status.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_visa_kind.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_visa_expiration_date.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_citizenships.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultIdProps.CodingKeys.id_period_nationality.rawValue)!
    ],
    Components.Schemas.CollectedInvestorProfileAttribute.investor_profile.rawValue: [
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_employment_status.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_occupation.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_employer.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_annual_income.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_net_worth.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_investment_goals.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_risk_tolerance.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_declarations.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_brokerage_firm_employer.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_senior_executive_symbols.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_family_member_names.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_political_organization.rawValue)!,
        Components.Schemas.VaultDI(rawValue: Components.Schemas.VaultInvestorProps.CodingKeys.investor_profile_period_funding_sources.rawValue)!
    ]
]
