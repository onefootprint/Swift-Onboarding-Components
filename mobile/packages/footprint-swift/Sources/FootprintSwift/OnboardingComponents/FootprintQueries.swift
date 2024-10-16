import Foundation

internal class FootprintQueries {
    private let client: OpenAPIClient
    private let configKey: String
    
    init(client: OpenAPIClient, configKey: String) {
        self.client = client
        self.configKey = configKey
    }
    
    func getOnboardingConfig() async throws -> PublicOnboardingConfiguration {
        return try await OnboardingAPI.getOnboardingConfig(xOnboardingConfigKey: self.configKey, openAPIClient: client)
    }
    
    func identify(email: String? = nil,
                  phoneNumber: String? = nil,
                  authToken: String? = nil,
                  sandboxId: String? = nil,
                  scope:  IdentifyRequest.Scope = .onboarding
    ) async throws ->  IdentifyResponse {
        
        let request = IdentifyRequest(email: email, phoneNumber: phoneNumber, scope: scope )
        
        return try await IdentifyAPI.identify(xOnboardingConfigKey: self.configKey, identifyRequest: request, openAPIClient: client)
    }
    
    func getSignupChallenge(email: String?, phoneNumber: String?,
                            kind: SignupChallengeRequest.ChallengeKind,
                            sandboxId: String? = nil) async throws ->  SignupChallengeResponse {
        let request = SignupChallengeRequest(
            challengeKind: kind,
            email: email != nil ? SignupChallengeRequestEmail(isBootstrap: false, value: email!) : nil,
            phoneNumber:  phoneNumber != nil ? SignupChallengeRequestEmail(isBootstrap: false, value: phoneNumber!) : nil,
            scope: SignupChallengeRequest.Scope.onboarding
        )
        
        return try await IdentifyAPI.signupChallenge(
            xOnboardingConfigKey: self.configKey,
            signupChallengeRequest: request,
            xSandboxId: sandboxId,
            xFpIsComponentsSdk: true,
            openAPIClient: client
        )
    }
    
    func getLoginChallenge(kind: LoginChallengeRequest.ChallengeKind? = LoginChallengeRequest.ChallengeKind.sms,
                           authToken: String) async throws -> LoginChallengeResponse {
        let request = LoginChallengeRequest(challengeKind: kind!)
        
        return try await IdentifyAPI.loginChallenge(xFpAuthorization: authToken, loginChallengeRequest: request, openAPIClient: client)
    }
    
    func getValidationToken(authToken: String) async throws -> HostedValidateResponse {
        return try await UserAPI.validationToken(xFpAuthorization: authToken, openAPIClient: client)
    }
    
    func createVaultingToken(authToken: String) async throws -> CreateUserTokenResponse {
        let request = CreateUserTokenRequest(requestedScope: .onboarding)
        
        return try await UserAPI.vaultingToken(xFpAuthorization: authToken, createUserTokenRequest: request, openAPIClient: client)
    }
    
    func verify(challenge: String, challengeToken: String, authToken: String) async throws -> IdentifyVerifyResponse {
        let request = IdentifyVerifyRequest(
            challengeResponse: challenge,
            challengeToken: challengeToken,
            scope: .onboarding
        )
        
        return try await IdentifyAPI.verify(xFpAuthorization: authToken, xOnboardingConfigKey: self.configKey, identifyVerifyRequest: request, openAPIClient: client)
    }
    
    func initOnboarding(
        authToken: String,
        overallOutcome: OverallOutcome? = OverallOutcome.pass
    ) async throws -> OnboardingResponse {
        let request = PostOnboardingRequest(fixtureResult: PostOnboardingRequest.FixtureResult(rawValue: overallOutcome!.rawValue))
        
        return try await OnboardingAPI.onboarding(xFpAuthorization: authToken, postOnboardingRequest: request, openAPIClient: client)
    }
    
    func getOnboardingStatus(authToken: String) async throws -> RequirementAttributes {
        let response = try await OnboardingAPI.onboardingStatus(xFpAuthorization: authToken, openAPIClient: client)
        return try RequirementAttributes.getRequirements(from: response)
    }
    
    func validateOnboarding(authToken: String) async throws -> HostedValidateResponse {
        return try await OnboardingAPI.validateOnboarding(xFpAuthorization: authToken, openAPIClient: client)
    }
    
    func decrypt(authToken: String, fields: [VaultDI]) async throws -> VaultData {
        let filteredFields = fields.filter { field in
            !["id.ssn9", "id.ssn4", "id.us_tax_id"].contains(field.rawValue) && !field.rawValue.starts(with: "document.")
        }
        
        let request = UserDecryptRequest(fields: filteredFields)
        
        return try await VaultAPI.decryptUserVault(xFpAuthorization: authToken, userDecryptRequest: request, openAPIClient: client)
    }
    
    func vault(
        authToken: String,
        vaultData: VaultData
    ) async throws -> JSONValue {
        let VaultData = VaultData(
            idAddressLine1: vaultData.idAddressLine1,
            idAddressLine2: vaultData.idAddressLine2,
            idCitizenships: vaultData.idCitizenships,
            idCity: vaultData.idCity,
            idCountry: vaultData.idCountry,
            idDob: vaultData.idDob,
            idDriversLicenseNumber: vaultData.idDriversLicenseNumber,
            idDriversLicenseState: vaultData.idDriversLicenseState,
            idEmail: vaultData.idEmail,
            idFirstName: vaultData.idFirstName,
            idItin: vaultData.idItin,
            idLastName: vaultData.idLastName,
            idMiddleName: vaultData.idMiddleName,
            idNationality: vaultData.idNationality,
            idPhoneNumber: vaultData.idPhoneNumber,
            idSsn4: vaultData.idSsn4,
            idSsn9: vaultData.idSsn9,
            idState: vaultData.idState,
            idUsLegalStatus: vaultData.idUsLegalStatus,
            idUsTaxId: vaultData.idUsTaxId,
            idVisaExpirationDate: vaultData.idVisaExpirationDate,
            idVisaKind: vaultData.idVisaKind,
            idZip: vaultData.idZip,
            investorProfileEmploymentStatus: vaultData.investorProfileEmploymentStatus,
            investorProfileOccupation: vaultData.investorProfileOccupation,
            investorProfileEmployer: vaultData.investorProfileEmployer,
            investorProfileAnnualIncome: vaultData.investorProfileAnnualIncome,
            investorProfileNetWorth: vaultData.investorProfileNetWorth,
            investorProfileFundingSources: vaultData.investorProfileFundingSources,
            investorProfileInvestmentGoals: vaultData.investorProfileInvestmentGoals,
            investorProfileRiskTolerance: vaultData.investorProfileRiskTolerance,
            investorProfileDeclarations: vaultData.investorProfileDeclarations,
            investorProfileSeniorExecutiveSymbols: vaultData.investorProfileSeniorExecutiveSymbols,
            investorProfileFamilyMemberNames: vaultData.investorProfileFamilyMemberNames,
            investorProfilePoliticalOrganization: vaultData.investorProfilePoliticalOrganization,
            investorProfileBrokerageFirmEmployer: vaultData.investorProfileBrokerageFirmEmployer
        )
        
        return try await VaultAPI.vault(xFpAuthorization: authToken, body: VaultData, openAPIClient: client)
    }
    
    func process(authToken: String,
                 overallOutcome: OverallOutcome? = OverallOutcome.pass
    ) async throws -> JSONValue {
        let request = ProcessRequest(fixtureResult: ProcessRequest.FixtureResult(rawValue: overallOutcome!.rawValue))
        
        do{
            return try await OnboardingAPI.process(xFpAuthorization: authToken, processRequest: request, openAPIClient: client)
        } catch {
            throw FootprintError.error(domain: .process, message: "Inline process not supported")
        }
    }
}
