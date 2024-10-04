import Foundation
import OpenAPIRuntime
import OpenAPIURLSession

public class FootprintQueries {
    private let client: Client
    private let configKey: String

    init(client: Client, configKey: String) {
        self.client = client
        self.configKey = configKey
    }

    func getOnboardingConfig() async throws -> Components.Schemas.PublicOnboardingConfiguration {
        let input = Operations.getOnboardingConfig.Input(
            headers: Operations.getOnboardingConfig.Input.Headers(
                X_hyphen_Onboarding_hyphen_Config_hyphen_Key: self.configKey)
        )
        
        let response = try await client.getOnboardingConfig(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.auth,
                                       message: "Unexpected error occurred while fetching onboarding config")
        }
    }

    func identify(email: String? = nil,
                  phoneNumber: String? = nil,
                  authToken: String? = nil,
                  sandboxId: String? = nil) async throws -> Components.Schemas.IdentifyResponse {
        let input = Operations.identify.Input(
            headers: Operations.identify.Input.Headers(
                X_hyphen_Sandbox_hyphen_Id:sandboxId,
                X_hyphen_Onboarding_hyphen_Config_hyphen_Key: self.configKey,
                X_hyphen_Fp_hyphen_Authorization: authToken                
            ),
            body: .json(Components.Schemas.IdentifyRequest(
                email: email,
                phone_number: phoneNumber,
                scope: Components.Schemas.IdentifyRequest.scopePayload.onboarding
            ))
        )
        
        let response = try await client.identify(input)

        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.auth,
                                       message: "Unexpected error occurred while identifying")
        }
    }

    func getSignupChallenge(email: String?, phoneNumber: String?,
                            kind: Components.Schemas.SignupChallengeRequest.challenge_kindPayload,
                            sandboxId: String? = nil) async throws -> Components.Schemas.SignupChallengeResponse {
        let input = Operations.signupChallenge.Input(
            headers: Operations.signupChallenge.Input.Headers(
                X_hyphen_Sandbox_hyphen_Id: sandboxId,
                X_hyphen_Fp_hyphen_Is_hyphen_Components_hyphen_Sdk: true,
                X_hyphen_Onboarding_hyphen_Config_hyphen_Key: self.configKey
            ), 
            body: .json(Components.Schemas.SignupChallengeRequest(
                challenge_kind: kind,
                email: email != nil ? Components.Schemas.SignupChallengeRequest.emailPayload(is_bootstrap: false, value: email!) : nil,
                phone_number: phoneNumber != nil ? Components.Schemas.SignupChallengeRequest.phone_numberPayload(is_bootstrap: false, value: phoneNumber!) : nil,
                scope: Components.Schemas.SignupChallengeRequest.scopePayload.onboarding
            ))
        )

        let response = try await client.signupChallenge(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.auth,
                                       message: "Unexpected error occurred while signup challenge")
        }
    }

    func getLoginChallenge(kind: Components.Schemas.LoginChallengeRequest.challenge_kindPayload? = Components.Schemas.LoginChallengeRequest.challenge_kindPayload.sms, authToken: String) async throws -> Components.Schemas.LoginChallengeResponse {
        let input = Operations.loginChallenge.Input(
            headers: Operations.loginChallenge.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken
            ),
            body: .json(Components.Schemas.LoginChallengeRequest(
                challenge_kind: kind!
            ))
        )

        let response = try await client.loginChallenge(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.auth,
                                       message: "Unexpected error occurred while login challenge")
        }
    }

    func getValidationToken(authToken: String) async throws -> Components.Schemas.HostedValidateResponse {
        let input = Operations.validationToken.Input(
            headers: Operations.validationToken.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken
            )
        )
        
        let response = try await client.validationToken(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.auth,
                                       message: "Unexpected error occurred while getting the validation token")
        }
    }

    func verify(challenge: String, challengeToken: String, authToken: String) async throws -> Components.Schemas.IdentifyVerifyResponse {
        let input = Operations.verify.Input(
            headers: Operations.verify.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken,
                X_hyphen_Onboarding_hyphen_Config_hyphen_Key: self.configKey
            ),
            body: .json(Components.Schemas.IdentifyVerifyRequest(
                challenge_response: challenge,
                challenge_token: challengeToken,
                scope: Components.Schemas.IdentifyVerifyRequest.scopePayload.onboarding
            ))
        )
        
        let response = try await client.verify(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.auth,
                                       message: "Unexpected error occurred while verifying")
        }
    }

    func initOnboarding(
        authToken: String,
        overallOutcome: OverallOutcome? = OverallOutcome.pass
    ) async throws -> Components.Schemas.OnboardingResponse {
        let input = Operations.onboarding.Input(
            headers: Operations.onboarding.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken
            ),
            body: .json(Components.Schemas.PostOnboardingRequest(
                fixture_result: Components.Schemas.PostOnboardingRequest.fixture_resultPayload(rawValue: overallOutcome!.rawValue)
            ))
        )
        
        let response = try await client.onboarding(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.onboarding,
                                       message: "Unexpected error occurred while initializing the onboarding")            
        }
    }

    func getOnboardingStatus(authToken: String) async throws -> RequirementAttributes {
        let input = Operations.onboardingStatus.Input(
            headers: Operations.onboardingStatus.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken
            )
        )
        
        let response = try await client.onboardingStatus(input)
        
        switch response {
        case .ok(let okResponse):
            return try  RequirementAttributes.getRequirements(from: okResponse.body.json)
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.onboarding,
                                       message: "Unexpected error occurred while fetching onboarding status")
        }
    }

    func validateOnboarding(authToken: String) async throws -> Components.Schemas.HostedValidateResponse {
        let input = Operations.validateOnboarding.Input(
            headers: Operations.validateOnboarding.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken
            )
        )
        
        let response = try await client.validateOnboarding(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.onboarding,
                                       message: "Unexpected error occurred during onboarding validation")
        }
    }

    func decrypt(authToken: String, fields: [Components.Schemas.VaultDI] ) async throws -> VaultData {
        let filteredFields = fields.filter { field in
            !["id.ssn9", "id.ssn4", "id.us_tax_id"].contains(field.rawValue) && !field.rawValue.starts(with: "document.")
        }

        let input = Operations.decryptUserVault.Input(
            headers: Operations.decryptUserVault.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken
            ),
           
            body: .json(Components.Schemas.UserDecryptRequest(
                fields: filteredFields
            ))
        )
        
        let response = try await client.decryptUserVault(input)
        
        switch response {
        case .ok(let okResponse):
            return try  VaultData.fromRawUserDataRequest(okResponse.body.json)
        default:            
            throw FootprintError.error(domain: FootprintErrorDomain.vault,
                                       message: "Unexpected error occurred during decryption")
        }
    }

    func vault(
        authToken: String,
        vaultData: VaultData
    ) async throws -> Components.Schemas.Empty {
        // VaultIdProps
        let vaultIdProps = Components.Schemas.VaultIdProps(
            id_period_address_line1: vaultData.idAddressLine1,
            id_period_address_line2: vaultData.idAddressLine2,
            id_period_citizenships: vaultData.idCitizenships,
            id_period_city: vaultData.idCity,
            id_period_country: vaultData.idCountry,
            id_period_dob: vaultData.idDob,
            id_period_drivers_license_number: vaultData.idDriversLicenseNumber,
            id_period_drivers_license_state: vaultData.idDriversLicenseState,
            id_period_email: vaultData.idEmail,
            id_period_first_name: vaultData.idFirstName,
            id_period_itin: vaultData.idItin,
            id_period_last_name: vaultData.idLastName,
            id_period_middle_name: vaultData.idMiddleName,
            id_period_nationality: vaultData.idNationality,
            id_period_phone_number: vaultData.idPhoneNumber,
            id_period_ssn4: vaultData.idSsn4,
            id_period_ssn9: vaultData.idSsn9,
            id_period_state: vaultData.idState,
            id_period_us_legal_status: vaultData.idUsLegalStatus,
            id_period_us_tax_id: vaultData.idUsTaxId,
            id_period_visa_expiration_date: vaultData.idVisaExpirationDate,
            id_period_visa_kind: vaultData.idVisaKind,
            id_period_zip: vaultData.idZip
        )
        // VaultInvestorProps
        let vaultInvestorProps = Components.Schemas.VaultInvestorProps(
            investor_profile_period_employment_status: vaultData.investorProfileEmploymentStatus,
            investor_profile_period_occupation: vaultData.investorProfileOccupation,
            investor_profile_period_employer: vaultData.investorProfileEmployer,
            investor_profile_period_annual_income: vaultData.investorProfileAnnualIncome,
            investor_profile_period_net_worth: vaultData.investorProfileNetWorth,
            investor_profile_period_funding_sources: vaultData.investorProfileFundingSources,
            investor_profile_period_investment_goals: vaultData.investorProfileInvestmentGoals,
            investor_profile_period_risk_tolerance: vaultData.investorProfileRiskTolerance,
            investor_profile_period_declarations: vaultData.investorProfileDeclarations,
            investor_profile_period_senior_executive_symbols: vaultData.investorProfileSeniorExecutiveSymbols,
            investor_profile_period_family_member_names: vaultData.investorProfileFamilyMemberNames,
            investor_profile_period_political_organization: vaultData.investorProfilePoliticalOrganization,
            investor_profile_period_brokerage_firm_employer: vaultData.investorProfileBrokerageFirmEmployer
        )
    
        
        let input = Operations.vault.Input(
            headers: Operations.vault.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken
            ),
            body: .json(Components.Schemas.RawUserDataRequest.init(
                value1: vaultIdProps,
                value2: vaultInvestorProps
               )
            )
        )            
        
        let response = try await client.vault(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        case .badRequest(let badRequestResponse):
            let error = try badRequestResponse.body.json
            throw FootprintError.error(domain: FootprintErrorDomain.vault,
                                       message: error.value2!.message,
                                       debug: error.value2?.debug,
                                       supportId:error.value2?.support_id,
                                       code: error.value2?.code,
                                       context: error.value1?.context)
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.vault,
                                       message: "Unexpected error occurred during vault creation")
        }

    }
    

    func process(authToken: String,
                 overallOutcome: OverallOutcome? = OverallOutcome.pass
    ) async throws -> Components.Schemas.Empty {
        let input = Operations.process.Input(
            headers: Operations.process.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken
            ),
            body: .json(Components.Schemas.ProcessRequest(
                fixture_result: Components.Schemas.ProcessRequest.fixture_resultPayload(rawValue: overallOutcome!.rawValue)
            ))
        )
        
        let response = try await client.process(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        case .badRequest(let badRequestResponse):
            let error = try badRequestResponse.body.json
            throw FootprintError.error(domain: FootprintErrorDomain.process,
                                       message: error.message,
                                       debug: error.debug,
                                       supportId:error.support_id,
                                       code: error.code)        
        default:
            throw FootprintError.error(domain: FootprintErrorDomain.process,
                                       message: "Unexpected error occurred during processing"
                                       )
        }
    }

}
