import Foundation
import OpenAPIRuntime
import OpenAPIURLSession
import CustomDump

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
            throw NSError(domain: "OnboardingConfigError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred"])
        }
    }

    func identify(email: String? = nil, phoneNumber: String? = nil, authToken: String? = nil) async throws -> Components.Schemas.IdentifyResponse {
        let input = Operations.identify.Input(
            headers: Operations.identify.Input.Headers(
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
            throw NSError(domain: "IdentifyError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred"])
        }
    }

    func getSignupChallenge(email: String, phoneNumber: String, kind: Components.Schemas.SignupChallengeRequest.challenge_kindPayload? = Components.Schemas.SignupChallengeRequest.challenge_kindPayload.sms, sandboxId: String? = nil) async throws -> Components.Schemas.SignupChallengeResponse {
        let input = Operations.signupChallenge.Input(
            headers: Operations.signupChallenge.Input.Headers(
                X_hyphen_Sandbox_hyphen_Id: sandboxId,
                X_hyphen_Fp_hyphen_Is_hyphen_Components_hyphen_Sdk: true,
                X_hyphen_Onboarding_hyphen_Config_hyphen_Key: self.configKey
            ), 
            body: .json(Components.Schemas.SignupChallengeRequest(
                challenge_kind: Components.Schemas.SignupChallengeRequest.challenge_kindPayload.sms,
                email: Components.Schemas.SignupChallengeRequest.emailPayload(is_bootstrap: false, value: email),
                phone_number: Components.Schemas.SignupChallengeRequest.phone_numberPayload(is_bootstrap: false, value: phoneNumber),
                scope: Components.Schemas.SignupChallengeRequest.scopePayload.onboarding
            ))
        )

        let response = try await client.signupChallenge(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw NSError(domain: "SignupChallengeError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred"])
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
            throw NSError(domain: "LoginChallengeError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred"])
        }
    }

    func getValidationToken() async throws -> Components.Schemas.HostedValidateResponse {
        let input = Operations.validationToken.Input(
            headers: Operations.validationToken.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: self.configKey
            )
        )
        
        let response = try await client.validationToken(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw NSError(domain: "ValidationTokenError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred"])
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
            throw NSError(domain: "VerifyError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred"])
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
            throw NSError(domain: "OnboardingError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred during onboarding"])
        }
    }

    func vaultingToken(authToken: String) async throws -> Components.Schemas.CreateUserTokenResponse {
        let input = Operations.vaultingToken.Input(
            headers: Operations.vaultingToken.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken
            ),
            body: .json(Components.Schemas.CreateUserTokenRequest(requested_scope: Components.Schemas.CreateUserTokenRequest.requested_scopePayload.onboarding
            ))
        )
        
        let response = try await client.vaultingToken(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw NSError(domain: "VaultingTokenError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Failed to obtain vaulting token"])
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
    
        // VaultCustomProps
        var vaultCustomProps: Components.Schemas.VaultCustomProps? = nil
        if let customProperties = vaultData.customProperties {
            vaultCustomProps = Components.Schemas.VaultCustomProps(additionalProperties: customProperties)
        }
        
        let input = Operations.vault.Input(
            headers: Operations.vault.Input.Headers(
                X_hyphen_Fp_hyphen_Authorization: authToken
            ),
            body: .json(Components.Schemas.RawUserDataRequest.init(
                value1: vaultIdProps,
                value2: vaultInvestorProps,
                value3: vaultCustomProps)
            )
        )            
        
        let response = try await client.vault(input)
        
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        case .badRequest(let badRequestResponse):
            let error = try badRequestResponse.body.json
            throw NSError(domain: "VaultError", code: 400, userInfo: [
                NSLocalizedDescriptionKey: error.value2?.message,
                "context": error.value1?.context])
        default:
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred during vault creation"])
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
            throw NSError(domain: "ProcessError", code: 400, userInfo: [
                NSLocalizedDescriptionKey: error.message,
                "debug": error.debug,
                "supportId": error.support_id,
                "code": error.code])
        default:
            throw NSError(domain: "ProcessError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred during processing"])
        }
    }

}
