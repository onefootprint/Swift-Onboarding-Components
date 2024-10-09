import Foundation
import OpenAPIRuntime
import OpenAPIURLSession

extension ProviderError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .providerError(let message):
            return message
        }
    }
}

enum ProviderError: Error {
    case providerError(String)
}


public final class FootprintProvider {
    private var client: Client
    private var configKey: String = ""
    private var authToken: String?
    private var verifiedAuthToken: String?
    private var vaultingToken: String?
    private var authTokenStatus: AuthTokenStatus?
    private var authValidationToken: String? // the validation token generated after auth part, not process
    private var vaultData: VaultData?
    private var queries: FootprintQueries!
    private var onboardingConfig: Components.Schemas.PublicOnboardingConfiguration?
    private var signupChallengeResponse: Components.Schemas.SignupChallengeResponse?
    private var loginChallengeResponse: Components.Schemas.LoginChallengeResponse?
    private var requirements : RequirementAttributes?
    private var sandboxId: String?  = nil
    private var sandboxOutcome: SandboxOutcome?
    private var l10n: FootprintL10n?
    private var appearance: FootprintAppearance?
    private(set) var isReady: Bool
    
    public static let shared: FootprintProvider = {
        let instance = FootprintProvider()
        return instance
    }()
    
    private init() {
#if DEBUG
        let serverURL = try! Servers.server2()
#else
        let serverURL = try! Servers.server1()
#endif
        self.client = Client(
            serverURL: serverURL,
            configuration: .init(dateTranscoder: .iso8601WithFractionalSeconds),
            transport: URLSessionTransport()
        )
        self.isReady = false
    }
    
    public func initialize(configKey: String,
                           authToken: String? = nil,
                           sandboxId: String? = nil,
                           sandboxOutcome: SandboxOutcome? = nil,
                           options: FootprintOptions? = nil,
                           l10n: FootprintL10n? = nil,
                           appearance: FootprintAppearance? = nil
    ) async throws {
        self.l10n = l10n
        self.appearance = appearance
        self.configKey = configKey
        self.authToken = authToken
        self.sandboxOutcome = sandboxOutcome
        self.queries = FootprintQueries(client: self.client, configKey: self.configKey)
        self.onboardingConfig  = try await self.queries.getOnboardingConfig()
        if(self.onboardingConfig != nil){
            self.isReady = true
        }
        
        if(self.onboardingConfig?.is_live == true){
            self.sandboxId = nil
            self.sandboxOutcome = nil
        }
        else {
            self.sandboxId = sandboxId ?? String(UUID().uuidString.prefix(12).filter { $0.isLetter || $0.isNumber })
            
            if(self.sandboxId?.rangeOfCharacter(from: CharacterSet.alphanumerics.inverted) != nil) {
                throw ProviderError.providerError("Invalid sandboxId. Can only contain alphanumeric characters.")
            }
            var overallOutcome = sandboxOutcome?.overallOutcome
            var documentOutcome = sandboxOutcome?.documentOutcome
            
            let requiresDoc = self.onboardingConfig?.requires_id_doc ?? false
            if(requiresDoc && documentOutcome == nil){
                documentOutcome = .pass
            }
            if(!requiresDoc && documentOutcome != nil){
                documentOutcome = nil
            }
            if(overallOutcome == nil){
                overallOutcome = .pass
            }
            self.sandboxOutcome = SandboxOutcome(overallOutcome: overallOutcome, documentOutcome: documentOutcome)
        }
    }
    
    private func validateAuthToken(authToken: String) async throws -> AuthTokenStatus {
        guard let obConfigKind = self.onboardingConfig?.kind else {
            throw ProviderError.providerError("No onboarding config kind not found. Please make sure that the public key is correct.")
        }
        
        var identifyScope = Components.Schemas.IdentifyRequest.scopePayload.onboarding
        if obConfigKind == .auth {
            identifyScope = Components.Schemas.IdentifyRequest.scopePayload.auth
        }
        
        var identifyResponse: Components.Schemas.IdentifyResponse? = nil
        do{
            identifyResponse = try await self.queries.identify(
                authToken: authToken,
                sandboxId: self.sandboxId,
                scope: identifyScope
            )
        }catch {
            self.authTokenStatus = .invalid
            throw ProviderError.providerError("Invalid auth token. Please provide a valid auth token.")
        }
        
        guard let identifyResponse else {
            throw ProviderError.providerError("Invalid auth token. Please provide a valid auth token.")
        }
        
        guard let tokenScopes = identifyResponse.user?.token_scopes else {
            self.authTokenStatus = .validWithInsufficientScope
            return AuthTokenStatus.validWithInsufficientScope
        }
        
        if tokenScopes.isEmpty{
            self.authTokenStatus = .validWithInsufficientScope
            return AuthTokenStatus.validWithInsufficientScope
        }
        
        // TODO: technically we should check if the token scopes has the required scope
        // but that check only matters for auth method update case
        // This is the required scope mapping in FE
        //  [IdentifyVariant.auth]: [],
        //  [IdentifyVariant.updateLoginMethods]: [UserTokenScope.explicitAuth],
        //  [IdentifyVariant.verify]: [],
        // So since we are only doing "verify" in our SDK, we don't need to check for the required scope
        // We just check if the tokenScopes is not empty
        // Relevant code in FE: frontend/packages/idv/src/components/identify/components/init-auth-token/init-auth-token.tsx
        
        if(obConfigKind == .auth){
            let validationToken = (try await self.queries.validateOnboarding(authToken: authToken)).validation_token
            self.authValidationToken = validationToken
            self.authTokenStatus = .validWithSufficientScope
            self.verifiedAuthToken = authToken
            return AuthTokenStatus.validWithSufficientScope
        }
        
        let validationToken = (try await self.queries.getValidationToken(authToken: authToken)).validation_token
        self.authValidationToken = validationToken
        
        let updatedAuthToken = (try await self.queries.initOnboarding(authToken: authToken, overallOutcome: self.sandboxOutcome?.overallOutcome)).auth_token
        self.verifiedAuthToken = updatedAuthToken
        
        let requirements = try await self.queries.getOnboardingStatus(authToken: updatedAuthToken)
        self.requirements = requirements
        
        let vaultData = try await getVaultData()
        self.vaultData = vaultData
        
        self.authTokenStatus = .validWithSufficientScope
        return AuthTokenStatus.validWithSufficientScope
        
    }
    
    private func tokenStatusToRequiresAuthResult(tokenStatus: AuthTokenStatus) throws -> (requiresAuth: Bool, verificationResult: Verify?) {
        switch tokenStatus {
        case .invalid:
            throw ProviderError.providerError("Invalid auth token")
        case .validWithInsufficientScope:
            return (requiresAuth: true, verificationResult: nil)
        case .validWithSufficientScope:
            return (requiresAuth: false, verificationResult: Verify(
                requirements: self.requirements,
                validationToken: self.authValidationToken ?? "",
                vaultData: self.vaultData
            )
            )
        }
    }
    
    public func requiresAuth() async throws -> (
        requiresAuth: Bool,
        verificationResult: Verify?
    ) {
        guard let obConfigKind = self.onboardingConfig?.kind else {
            throw ProviderError.providerError("No onboarding config kind not found. Please make sure that the public key is correct.")
        }
        
        // If we already have a vaulting token or verified, we went through the verification steps - no need to autheticate again
        // TODO: should we send updated requirements?
        if (self.vaultingToken != nil || self.verifiedAuthToken != nil) {
            return (
                requiresAuth: false,
                verificationResult: Verify(
                    requirements: self.requirements,
                    validationToken: self.authValidationToken ?? "",
                    vaultData: self.vaultData
                )
            )
        }
        
        guard let authToken = self.authToken else {
            return (requiresAuth: true, verificationResult: nil)
        }
        
        guard let authTokenStatus = self.authTokenStatus else {
            // validate and then return
            let tokenStatus = try await self.validateAuthToken(authToken: authToken)
            return try tokenStatusToRequiresAuthResult(tokenStatus: tokenStatus)
        }
        
        return try tokenStatusToRequiresAuthResult(tokenStatus: authTokenStatus)
    }
    
    func createChallenge(email: String? = nil, phoneNumber: String? = nil, authToken: String? = nil) async throws  {
        guard let obConfig = self.onboardingConfig else {
            throw ProviderError.providerError("No onboarding config found. Please make sure that the public key is correct.")
        }
        
        guard let requiredAuthMethods = self.onboardingConfig?.required_auth_methods else {
            throw ProviderError.providerError("No required auth methods found in the onboarding config")
        }
        
        var identifyScope = Components.Schemas.IdentifyRequest.scopePayload.onboarding
        if let obConfigKind = self.onboardingConfig?.kind{
            if obConfigKind == .auth {
                identifyScope = Components.Schemas.IdentifyRequest.scopePayload.auth
            }
        }
        
        let identifyResponse = try await self.queries.identify(
            email: email,
            phoneNumber: phoneNumber,
            authToken: authToken,
            sandboxId: self.sandboxId,
            scope: identifyScope
        )
        
        if let user = identifyResponse.user {
            let hasVerifiedSource = user.auth_methods.contains { $0.is_verified }
            guard hasVerifiedSource else {
                throw ProviderError.providerError("Cannot verify inline. No verified source found")
            }
            let hasVerifiedPhone = user.auth_methods.contains { $0.kind == .phone && $0.is_verified }
            let hasVerifiedEmail = user.auth_methods.contains { $0.kind == .email && $0.is_verified }
            if requiredAuthMethods.contains(.phone) && !hasVerifiedPhone {
                throw ProviderError.providerError("Inline OTP not supported - phone is required but has not been verified")
            }
            if requiredAuthMethods.contains(.email) && !hasVerifiedEmail {
                throw ProviderError.providerError("Inline OTP not supported - email is required but has not been verified")
            }
            if hasVerifiedPhone {
                self.loginChallengeResponse = try await self.queries.getLoginChallenge(kind: .sms, authToken: user.token)
                return
            }
            if hasVerifiedEmail {
                self.loginChallengeResponse = try await self.queries.getLoginChallenge(kind: .email, authToken: user.token)
                return
            }
            throw ProviderError.providerError("Cannot verify inline")
        }
        
        let preferredAuthMethod = requiredAuthMethods.contains(.phone) ? Components.Schemas.SignupChallengeRequest.challenge_kindPayload.sms : Components.Schemas.SignupChallengeRequest.challenge_kindPayload.email
        
        self.signupChallengeResponse = try await self.queries.getSignupChallenge(
            email: email,
            phoneNumber: phoneNumber,
            kind: preferredAuthMethod,
            sandboxId: self.sandboxId
        )
    }
    
    
    public func createEmailPhoneBasedChallenge(email: String? = nil, phoneNumber: String? = nil) async throws  {
        if let requiredAuthMethods = self.onboardingConfig?.required_auth_methods {
            if requiredAuthMethods.isEmpty {
                throw ProviderError.providerError("No required auth methods found in the onboarding config")
            }
            if requiredAuthMethods.count > 1 {
                throw ProviderError.providerError("Multiple auth methods are supported")
            }
            if requiredAuthMethods.contains(.phone) && phoneNumber == nil {
                throw ProviderError.providerError("Phone number is required")
            }
            if requiredAuthMethods.contains(.email) && email == nil {
                throw ProviderError.providerError("Email is required")
            }
        }
        
        if let authToken = self.authToken {
            throw ProviderError.providerError("You provided an auth token. Please authenticate using it or remove the auth token and authenticate using email/phone number")
        }
        
        try await createChallenge(email: email, phoneNumber: phoneNumber)
    }
    
    public func createAuthTokenBasedChallenge() async throws  {
        guard let authToken = self.authToken else {
            throw ProviderError.providerError("No auth token found")
        }
        
        guard let authTokenStatus = self.authTokenStatus else {
            throw ProviderError.providerError("You must call 'requiresAuth()' before calling 'createAuthTokenBasedChallenge()'")
        }
        
        if (authTokenStatus == .invalid) {
            throw ProviderError.providerError("Invalid auth token. Please provide a valid auth token")
        }
        
        if let requiredAuthMethods = self.onboardingConfig?.required_auth_methods {
            if requiredAuthMethods.isEmpty {
                throw ProviderError.providerError("No required auth methods found in the onboarding config")
            }
            if requiredAuthMethods.count > 1 {
                throw ProviderError.providerError("Multiple auth methods are supported")
            }
        }
        
        try await createChallenge(authToken: authToken)
    }
    
    public func verify(verificationCode: String) async throws -> Verify {
        guard let challengeToken = self.loginChallengeResponse?.challenge_data.challenge_token ??  self.signupChallengeResponse?.challenge_data.challenge_token,
              let challengeAuthToken = self.loginChallengeResponse?.challenge_data.token ?? self.signupChallengeResponse?.challenge_data.token else {
            throw NSError(domain: "SubmitOTPError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing challenge token or auth token"])
        }
        
        guard let obConfigKind = self.onboardingConfig?.kind else {
            throw NSError(domain: "SubmitOTPError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing onboarding config kind"])
        }
        let verifyResponse = try await self.queries.verify(
            challenge: verificationCode,
            challengeToken: challengeToken,
            authToken: challengeAuthToken
        )
        var validationToken: String = ""
        var updatedAuthToken: String = verifyResponse.auth_token
        var updatedRequirements: RequirementAttributes? = nil
        var updatedVaultData: VaultData? = nil
        
        if obConfigKind == .auth {
            validationToken = (try await self.queries.validateOnboarding(authToken: verifyResponse.auth_token)).validation_token
            self.verifiedAuthToken = updatedAuthToken
            self.authValidationToken = validationToken
        }else{
            validationToken = (try await self.queries.getValidationToken(authToken: verifyResponse.auth_token)).validation_token
            self.authValidationToken = validationToken
            updatedAuthToken = (try await self.queries.initOnboarding(authToken: verifyResponse.auth_token, overallOutcome: self.sandboxOutcome?.overallOutcome)).auth_token
            self.verifiedAuthToken = updatedAuthToken
            updatedRequirements = try await self.queries.getOnboardingStatus(authToken: updatedAuthToken)
            self.requirements = updatedRequirements
            updatedVaultData = try await getVaultData()
            self.vaultData = updatedVaultData
            self.vaultingToken = (try await self.queries.createVaultingToken(authToken: updatedAuthToken)).token
        }
        
        return  Verify(requirements: updatedRequirements, validationToken: validationToken, vaultData: updatedVaultData)
    }
    
    public func getVaultData() async throws -> VaultData {
        guard let authToken = self.verifiedAuthToken else {
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        }
        guard let requirements = self.requirements else {
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing requirements"])
        }
        
        return try await self.queries.decrypt(authToken: authToken,
                                              fields: requirements.fields.collected + requirements.fields.missing + requirements.fields.optional)
    }
    
    
    public func vault(vaultData: VaultData) async throws {
        guard let obConfigKind = self.onboardingConfig?.kind else {
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing onboarding configuration kind"])
        }
        
        if obConfigKind != .kyc {
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unsupported onboarding configuration kind. Only KYC is supported"])
        }
        
        guard let authToken = self.vaultingToken else {
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing vaulting token"])
        }
        
        try await self.queries.vault(authToken: authToken, vaultData: vaultData)
    }
    
    
    public func process() async throws -> Components.Schemas.HostedValidateResponse {
        guard let obConfigKind = self.onboardingConfig?.kind else {
            throw NSError(domain: "ProcessError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing onboarding configuration kind"])
        }
        
        if obConfigKind != .kyc {
            throw NSError(domain: "ProcessError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unsupported onboarding configuration kind. Only KYC is supported"])
        }
        
        guard let authToken = self.verifiedAuthToken else {
            throw NSError(domain: "ProcessError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        }
        
        try await self.queries.process(authToken: authToken, overallOutcome: self.sandboxOutcome?.overallOutcome)
        
        return try await self.queries.validateOnboarding(authToken: authToken)
    }
    
    public func handoff(
        onCancel: (() -> Void)? = nil,
        onComplete: ((_ validationToken: String) -> Void)? = nil,
        onError: ((_ errorMessage: String) -> Void)? = nil
    ) async throws {
        guard let authToken = self.verifiedAuthToken else {
            throw NSError(domain: "HandoffError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        }
        
        guard let obConfigKind = self.onboardingConfig?.kind else {
            throw NSError(domain: "HandooffError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing onboarding configuration kind"])
        }
        
        if obConfigKind != .kyc {
            throw NSError(domain: "HandoffError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unsupported onboarding configuration kind. Only KYC is supported"])
        }
        
        
        let config = FootprintConfiguration(
            publicKey: self.configKey,
            authToken:  authToken,
            sandboxId: self.sandboxId,
            isComponentsSdk: true,
            sandboxOutcome: self.sandboxOutcome,
            scheme: "footprintapp-callback",
            l10n: self.l10n,
            appearance: self.appearance,
            onCancel: onCancel,
            onComplete: onComplete,
            onError: onError
        )
        try await Footprint.initialize(with: config)
    }
}
