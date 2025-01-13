import Foundation

internal class FootprintQueries {
    private let client: OpenAPIClient
    private let configKey: String
    
    init(client: OpenAPIClient, configKey: String) {
        self.client = client
        self.configKey = configKey
    }
    
    func getQueryErrorMessage(errorResponse: ErrorResponse) -> String {
        var message = "An unknown error occurred." // Default fallback message
        
        // Check for the specific error type
        switch errorResponse {
        case let .error(statusCode, data, response, underlyingError):
            guard let data = data else {
                return "No error data available."
            }
            
            // Attempt to parse the JSON object safely
            do {
                if let jsonObject = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                    message = jsonObject["message"] as? String ?? "No error message provided in response."
                } else {
                    message = "Error response data is not in the expected format."
                }
            } catch {
                message = "Failed to parse error response: \(error.localizedDescription)"
            }
        }
        
        return message
    }
    
    func getVaultErrorContext(errorResponse: ErrorResponse) -> [String: String]? {
        var errContext: [String: String]? = nil
        
        switch errorResponse {
        case let .error(statusCode, data, response, underlyingError):
            // Ensure data is not nil before attempting to parse
            guard let data = data else {
                return nil
            }
            
            do {
                // Safely attempt to parse the JSON object
                if let jsonObject = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
                   let context = jsonObject["context"] as? [String: String] {
                    errContext = context
                }
            } catch {
                // Handle JSON parsing error (optional: add logging or debugging output here)
                print("Failed to parse error context: \(error.localizedDescription)")
            }
        }
        
        return errContext
    }
    
    func getOnboardingConfig() async throws -> PublicOnboardingConfiguration {
        do {
            return try await OnboardingAPI.getOnboardingConfig(xOnboardingConfigKey: self.configKey, openAPIClient: client)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .initializationError, message: "Get onboarding config request failed. \(errorMessage)")
        } catch {
            throw FootprintError(kind: .initializationError, message: "Get onboarding config request failed. \(error.localizedDescription)")
        }
    }
    
    
    func identify(email: String? = nil,
                  phoneNumber: String? = nil,
                  authToken: String? = nil,
                  sandboxId: String? = nil,
                  scope:  IdentifyRequest.Scope = .onboarding
    ) async throws ->  IdentifyResponse {
        let request = IdentifyRequest(email: email, phoneNumber: phoneNumber, scope: scope )
        do {
            return try await IdentifyAPI.identify(xOnboardingConfigKey: self.configKey, identifyRequest: request, xSandboxId: sandboxId, xFpAuthorization: authToken, openAPIClient: client)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .authError, message: "Identify request failed. \(errorMessage)")
        }
        catch{
            throw FootprintError(kind: .authError, message: "Identify request failed. \(error.localizedDescription)")
        }
    }
    
    func getSignupChallenge(email: String?, phoneNumber: String?,
                            kind: SignupChallengeRequest.ChallengeKind,
                            sandboxId: String? = nil,
                            scope: SignupChallengeRequest.Scope = .onboarding
    ) async throws ->  SignupChallengeResponse {
        let request = SignupChallengeRequest(
            challengeKind: kind,
            email: email != nil ? SignupChallengeRequestEmail(isBootstrap: false, value: email!) : nil,
            phoneNumber:  phoneNumber != nil ? SignupChallengeRequestEmail(isBootstrap: false, value: phoneNumber!) : nil,
            scope: scope
        )
        
        do{
            return try await IdentifyAPI.signupChallenge(
                xOnboardingConfigKey: self.configKey,
                signupChallengeRequest: request,
                xSandboxId: sandboxId,
                xFpIsComponentsSdk: true,
                openAPIClient: client
            )
        }
        catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .authError, message: "Signup challenge request failed. \(errorMessage)")
        }catch {
            throw FootprintError(kind: .authError, message: "Signup challenge request failed. \(error.localizedDescription)")
        }
    }
    
    func getLoginChallenge(kind: LoginChallengeRequest.ChallengeKind? = LoginChallengeRequest.ChallengeKind.sms,
                           authToken: String) async throws -> LoginChallengeResponse {
        let request = LoginChallengeRequest(challengeKind: kind!)
        do {
            return try await IdentifyAPI.loginChallenge(xFpAuthorization: authToken, loginChallengeRequest: request, openAPIClient: client)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .authError, message: "Login challenge request failed. \(errorMessage)")
        } catch {
            throw FootprintError(kind: .authError, message: "Login challenge request failed. \(error.localizedDescription)")
        }
    }
    
    func getValidationToken(authToken: String) async throws -> HostedValidateResponse {
        do {
            return try await UserAPI.validationToken(xFpAuthorization: authToken, openAPIClient: client)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .userError, message: "Validation token request failed. \(errorMessage)")
        } catch {
            throw FootprintError(kind: .userError, message: "Validation token request failed. \(error.localizedDescription)")
        }
    }
    
    func createVaultingToken(authToken: String) async throws -> CreateUserTokenResponse {
        let request = CreateUserTokenRequest(requestedScope: .onboarding)
        do{
            return try await UserAPI.vaultingToken(xFpAuthorization: authToken, createUserTokenRequest: request, openAPIClient: client)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .userError, message: "Create vaulting token request failed. \(errorMessage)")
        } catch {
            throw FootprintError(kind: .userError, message: "Create vaulting token request failed. \(error.localizedDescription)")
        }
    }
    
    func verify(challenge: String, challengeToken: String, authToken: String, scope: IdentifyVerifyRequest.Scope = .onboarding) async throws -> IdentifyVerifyResponse {
        let request = IdentifyVerifyRequest(
            challengeResponse: challenge,
            challengeToken: challengeToken,
            scope: scope
        )
        do {
            return try await IdentifyAPI.verify(xFpAuthorization: authToken, xOnboardingConfigKey: self.configKey, identifyVerifyRequest: request, openAPIClient: client)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .authError, message: "Verify request failed. \(errorMessage)")
        } catch {
            throw FootprintError(kind: .authError, message: "Verify request failed. \(error.localizedDescription)")
        }
    }
    
    func initOnboarding(
        authToken: String,
        overallOutcome: OverallOutcome?
    ) async throws -> OnboardingResponse {
        var fixtureResult: PostOnboardingRequest.FixtureResult? = nil
        if let overallOutcome {
            fixtureResult = PostOnboardingRequest.FixtureResult(rawValue: overallOutcome.rawValue)
        }
        let request = PostOnboardingRequest(fixtureResult: fixtureResult)
        do{
            return try await OnboardingAPI.onboarding(xFpAuthorization: authToken, postOnboardingRequest: request, openAPIClient: client)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .onboardingError, message: "Init onboarding request failed. \(errorMessage)")
        } catch {
            throw FootprintError(kind: .onboardingError, message: "Init onboarding request failed. \(error.localizedDescription)")
        }
    }
    
    func getOnboardingStatus(authToken: String) async throws -> RequirementAttributes {
        let response = try await OnboardingAPI.onboardingStatus(xFpAuthorization: authToken, openAPIClient: client)
        do {
            return try RequirementAttributes.getRequirements(from: response)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .onboardingError, message: "Get onboarding status request failed. \(errorMessage)")
        } catch {
            throw FootprintError(kind: .onboardingError, message: "Get onboarding status request failed. \(error.localizedDescription)")
        }
    }
    
    func validateOnboarding(authToken: String) async throws -> HostedValidateResponse {
        do{
            return try await OnboardingAPI.validateOnboarding(xFpAuthorization: authToken, openAPIClient: client)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .onboardingError, message: "Validate onboarding request failed. \(errorMessage)")
        } catch {
            throw FootprintError(kind: .onboardingError, message: "Validate onboarding request failed. \(error.localizedDescription)")
        }
    }
    
    func decrypt(authToken: String, fields: [VaultDI]) async throws -> VaultData {
        let filteredFields = fields.filter { field in
            !["id.ssn9", "id.ssn4", "id.us_tax_id"].contains(field.rawValue) && !field.rawValue.starts(with: "document.")
        }
        
        let request = UserDecryptRequest(fields: filteredFields)
        do {
            return try await VaultAPI.decryptUserVault(xFpAuthorization: authToken, userDecryptRequest: request, openAPIClient: client)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            throw FootprintError(kind: .decryptionError, message: "Decrypt request failed. \(errorMessage)")
        } catch {
            throw FootprintError(kind: .decryptionError, message: "Decrypt request failed. \(error.localizedDescription)")
        }
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
        do{
            return try await VaultAPI.vault(xFpAuthorization: authToken, body: VaultData, openAPIClient: client)
        } catch let errorResponse as ErrorResponse {
            let errorMessage = getQueryErrorMessage(errorResponse: errorResponse)
            let errorContext = getVaultErrorContext(errorResponse: errorResponse)
            throw FootprintError(kind: .vaultingError(context: errorContext), message: "Vault request failed. \(errorMessage)")
        } catch {
            throw FootprintError(kind: .vaultingError(context: nil), message: "Vault request failed. \(error.localizedDescription)")
        }
    }
    
    func process(authToken: String,
                 overallOutcome: OverallOutcome?
    ) async throws -> JSONValue {
        var fixtureResult: ProcessRequest.FixtureResult? = nil
        if let overallOutcome {
            fixtureResult = ProcessRequest.FixtureResult(rawValue: overallOutcome.rawValue)
        }
        let request = ProcessRequest(fixtureResult:fixtureResult)
        
        do{
            return try await OnboardingAPI.process(xFpAuthorization: authToken, processRequest: request, openAPIClient: client)
        } catch {
            throw FootprintError(kind: .inlineProcessNotSupported, message: "Inline process is not supported. Please call the handoff function to complete the flow.")
        }
    }
}
