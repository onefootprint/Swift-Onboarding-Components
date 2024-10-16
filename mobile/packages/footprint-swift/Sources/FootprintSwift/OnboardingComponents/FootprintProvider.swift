import Foundation

public final class FootprintProvider {
    private var client: OpenAPIClient
    private var configKey: String = ""
    private var authToken: String?
    private var verifiedAuthToken: String?
    private var vaultingToken: String?
    private var authTokenStatus: AuthTokenStatus?
    private var authValidationToken: String? // the validation token generated after auth part, not process
    private var vaultData: VaultData?
    private var queries: FootprintQueries!
    private var onboardingConfig: PublicOnboardingConfiguration?
    private var signupChallengeResponse: SignupChallengeResponse?
    private var loginChallengeResponse: LoginChallengeResponse?
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
        self.client = OpenAPIClient(
            basePath: FootprintSdkMetadata.apiBaseUrl
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
        
        if(self.onboardingConfig?.isLive == true){
            self.sandboxId = nil
            self.sandboxOutcome = nil
        }
        else {
            self.sandboxId = sandboxId ?? String(UUID().uuidString.prefix(12).filter { $0.isLetter || $0.isNumber })
            
            if(self.sandboxId?.rangeOfCharacter(from: CharacterSet.alphanumerics.inverted) != nil) {
                throw FootprintError(kind: .initializationError, message: "Invalid sandboxId. Can only contain alphanumeric characters.")
            }
            var overallOutcome = sandboxOutcome?.overallOutcome
            var documentOutcome = sandboxOutcome?.documentOutcome
            
            let requiresDoc = self.onboardingConfig?.requiresIdDoc ?? false
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
            throw FootprintError(kind: .initializationError, message: "No onboarding config kind not found. Please make sure that the public key is correct.")
        }
        
        var identifyScope = IdentifyRequest.Scope.onboarding
        if obConfigKind == .auth {
            identifyScope = IdentifyRequest.Scope.auth
        }
        
        var identifyResponse: IdentifyResponse? = nil
        do{
            identifyResponse = try await self.queries.identify(
                authToken: authToken,
                sandboxId: self.sandboxId,
                scope: identifyScope
            )
        }catch {
            self.authTokenStatus = .invalid
            throw FootprintError(kind: .initializationError, message: "Invalid auth token. Please provide a valid auth token.")
        }
        
        guard let identifyResponse else {
            throw FootprintError(kind: .initializationError, message: "Invalid auth token. Please provide a valid auth token.")
        }
        
        guard let tokenScopes = identifyResponse.user?.tokenScopes else {
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
            let validationToken = (try await self.queries.validateOnboarding(authToken: authToken)).validationToken
            self.authValidationToken = validationToken
            self.authTokenStatus = .validWithSufficientScope
            self.verifiedAuthToken = authToken
            return AuthTokenStatus.validWithSufficientScope
        }
        
        let validationToken = (try await self.queries.getValidationToken(authToken: authToken)).validationToken
        self.authValidationToken = validationToken
        
        let updatedAuthToken = (try await self.queries.initOnboarding(authToken: authToken, overallOutcome: self.sandboxOutcome?.overallOutcome)).authToken
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
            throw FootprintError(kind: .initializationError, message: "Invalid auth token")
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
            throw FootprintError(kind: .initializationError, message: "No onboarding config kind not found. Please make sure that the public key is correct.")
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
            throw FootprintError(kind: .initializationError, message: "No onboarding config found. Please make sure that the public key is correct.")
        }
        
        guard let requiredAuthMethods = self.onboardingConfig?.requiredAuthMethods else {
            throw FootprintError(kind: .authError, message: "No required auth methods found in the onboarding config")
        }
        
        var identifyScope = IdentifyRequest.Scope.onboarding
        if let obConfigKind = self.onboardingConfig?.kind{
            if obConfigKind == .auth {
                identifyScope = IdentifyRequest.Scope.auth
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
            let hasVerifiedSource = user.authMethods.contains { $0.isVerified }
            guard hasVerifiedSource else {
                throw FootprintError(kind: .inlineOtpNotSupported, message: "Cannot verify inline. No verified source found")
            }
            let hasVerifiedPhone = user.authMethods.contains { $0.kind == .phone && $0.isVerified }
            let hasVerifiedEmail = user.authMethods.contains { $0.kind == .email && $0.isVerified }
            if requiredAuthMethods.contains(.phone) && !hasVerifiedPhone {
                throw FootprintError(kind: .inlineOtpNotSupported, message: "Phone is required but has not been verified")
            }
            if requiredAuthMethods.contains(.email) && !hasVerifiedEmail {
                throw FootprintError(kind: .inlineOtpNotSupported, message: "Email is required but has not been verified")
            }
            if hasVerifiedPhone {
                self.loginChallengeResponse = try await self.queries.getLoginChallenge(kind: .sms, authToken: user.token)
                return
            }
            if hasVerifiedEmail {
                self.loginChallengeResponse = try await self.queries.getLoginChallenge(kind: .email, authToken: user.token)
                return
            }
            throw FootprintError(kind: .inlineOtpNotSupported, message: "No verified source found")
        }
        
        let preferredAuthMethod = requiredAuthMethods.contains(.phone) ? SignupChallengeRequest.ChallengeKind.sms : SignupChallengeRequest.ChallengeKind.email
        
        self.signupChallengeResponse = try await self.queries.getSignupChallenge(
            email: email,
            phoneNumber: phoneNumber,
            kind: preferredAuthMethod,
            sandboxId: self.sandboxId
        )
    }
    
    
    public func createEmailPhoneBasedChallenge(email: String? = nil, phoneNumber: String? = nil) async throws  {
        if let requiredAuthMethods = self.onboardingConfig?.requiredAuthMethods {
            if requiredAuthMethods.isEmpty {
                throw FootprintError(kind: .authError, message: "No required auth methods found in the onboarding config")
            }
            if requiredAuthMethods.count > 1 {
                throw FootprintError(kind: .authError, message: "Multiple auth methods are not supported")
            }
            if requiredAuthMethods.contains(.phone) && phoneNumber == nil {
                throw FootprintError(kind: .authError, message: "Phone number is required")
            }
            if requiredAuthMethods.contains(.email) && email == nil {
                throw FootprintError(kind: .authError, message: "Email is required")
            }
        }
        
        if let authToken = self.authToken {
            throw FootprintError(kind: .authError, message: "You provided an auth token. Please authenticate using it or remove the auth token and authenticate using email/phone number")
        }
        
        try await createChallenge(email: email, phoneNumber: phoneNumber)
    }
    
    public func createAuthTokenBasedChallenge() async throws  {
        guard let authToken = self.authToken else {
            throw FootprintError(kind: .authError, message: "No auth token found")
        }
        
        guard let authTokenStatus = self.authTokenStatus else {
            throw FootprintError(kind: .authError, message: "You must call 'requiresAuth()' before calling 'createAuthTokenBasedChallenge()'")
        }
        
        if (authTokenStatus == .invalid) {
            throw FootprintError(kind: .authError, message: "Invalid auth token. Please provide a valid auth token")
        }
        
        if let requiredAuthMethods = self.onboardingConfig?.requiredAuthMethods {
            if requiredAuthMethods.isEmpty {
                throw FootprintError(kind: .authError, message: "No required auth methods found in the onboarding config")
            }
            if requiredAuthMethods.count > 1 {
                throw FootprintError(kind: .authError, message: "Multiple auth methods are not supported")
            }
        }
        
        try await createChallenge(authToken: authToken)
    }
    
    public func verify(verificationCode: String) async throws -> Verify {
        guard let challengeToken = self.loginChallengeResponse?.challengeData.challengeToken ??  self.signupChallengeResponse?.challengeData.challengeToken,
              let challengeAuthToken = self.loginChallengeResponse?.challengeData.token ?? self.signupChallengeResponse?.challengeData.token else {
            throw FootprintError(kind: .authError, message: "Missing challenge token or challenge auth token")
        }
        
        guard let obConfigKind = self.onboardingConfig?.kind else {
            throw FootprintError(kind: .initializationError, message: "No onboarding config kind not found. Please make sure that the public key is correct.")
        }
        let verifyResponse = try await self.queries.verify(
            challenge: verificationCode,
            challengeToken: challengeToken,
            authToken: challengeAuthToken
        )
        var validationToken: String = ""
        var updatedAuthToken: String = verifyResponse.authToken
        var updatedRequirements: RequirementAttributes? = nil
        var updatedVaultData: VaultData? = nil
        
        if obConfigKind == .auth {
            validationToken = (try await self.queries.validateOnboarding(authToken: verifyResponse.authToken)).validationToken
            self.verifiedAuthToken = updatedAuthToken
            self.authValidationToken = validationToken
        }else{
            validationToken = (try await self.queries.getValidationToken(authToken: verifyResponse.authToken)).validationToken
            self.authValidationToken = validationToken
            updatedAuthToken = (try await self.queries.initOnboarding(authToken: verifyResponse.authToken, overallOutcome: self.sandboxOutcome?.overallOutcome)).authToken
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
            throw FootprintError(kind: .authError, message: "Missing authentication token")
        }
        guard let requirements = self.requirements else {
            throw FootprintError(kind: .onboardingError, message: "Missing requirements")
        }
        
        return try await self.queries.decrypt(authToken: authToken,
                                              fields: requirements.fields.collected + requirements.fields.missing + requirements.fields.optional)
    }
    
    
    public func vault(vaultData: VaultData) async throws {
        guard let obConfigKind = self.onboardingConfig?.kind else {
            throw FootprintError(kind: .initializationError, message: "Missing onboarding configuration kind")
        }
        
        if obConfigKind != .kyc {
            throw FootprintError(kind: .notAllowed, message: "Unsupported onboarding configuration kind. Only KYC is supported")
        }
        
        guard let authToken = self.vaultingToken else {
            throw FootprintError(kind: .userError, message: "Missing vaulting token")
        }
        
        try await self.queries.vault(authToken: authToken, vaultData: vaultData)
    }
    
    
    public func process() async throws -> HostedValidateResponse {
        guard let obConfigKind = self.onboardingConfig?.kind else {
            throw FootprintError(kind: .initializationError, message: "Missing onboarding configuration kind")
        }
        
        if obConfigKind != .kyc {
            throw FootprintError(kind: .notAllowed, message: "Unsupported onboarding configuration kind. Only KYC is supported")
        }
        
        guard let authToken = self.verifiedAuthToken else {
            throw FootprintError(kind: .authError, message: "Missing authentication token")
        }
        
        try await self.queries.process(authToken: authToken, overallOutcome: self.sandboxOutcome?.overallOutcome)
        
        return try await self.queries.validateOnboarding(authToken: authToken)
    }
    
    
    public func launchIdentify(
        email: String?,
        phone: String?,
        onCancel: (() -> Void)? = nil,
        onAuthenticated: ((_ result: Verify) -> Void)? = nil,
        onError: ((_ errorMessage: String) -> Void)? = nil
    ) async throws{
        guard let obConfigKind = self.onboardingConfig?.kind else {
            onError?("Missing onboarding configuration kind")
            return
        }
        
        let hasEmailOrPhone = email != nil || phone != nil
        
        if hasEmailOrPhone && self.authToken != nil {
            onError?("Please don't use both email/phone and auth token at the same time")
            return
        }
        
        let onCompleteCallback: ((String) -> Void)? = obConfigKind == .auth ? { validationToken in
            self.authValidationToken = validationToken
            onAuthenticated?(
                Verify(
                    requirements: nil,
                    validationToken: validationToken,
                    vaultData: nil
                )
            )
        } : nil
        
        
        var onAuth: ((String, String) async throws -> Verify) = { authToken, vaultingToken in
            self.verifiedAuthToken = authToken
            self.vaultingToken = vaultingToken
            let validationToken = (try await self.queries.getValidationToken(authToken: authToken)).validationToken
            self.authValidationToken = validationToken
            let requirements = try await self.queries.getOnboardingStatus(authToken: authToken)
            self.requirements = requirements
            let vaultData = try await self.getVaultData()
            self.vaultData = vaultData
            return Verify(requirements: requirements, validationToken: validationToken, vaultData: vaultData)
        }
        
        let onAuthenticationCompleteCallback: ((String, String) -> Void)? = obConfigKind == .auth ? nil :
        { authToken, vaultingToken in
            Task {
                do {
                    let verification = try await onAuth(authToken, vaultingToken)
                    onAuthenticated?(verification)
                } catch {
                    onError?(error.localizedDescription)
                }
            }
        }
        
        let config = FootprintConfiguration(
            publicKey: self.configKey,
            authToken:  authToken,
            sandboxId: self.sandboxId,
            sandboxOutcome: self.sandboxOutcome,
            scheme: "footprintapp-callback",
            bootstrapData: FootprintBootstrapData(email: email, phoneNumber: phone),
            l10n: self.l10n,
            appearance: self.appearance,
            isAuthPlaybook: obConfigKind == .auth,
            isComponentsSdk: true,
            shouldRelayToComponents: true,
            onCancel: onCancel,
            onComplete: onCompleteCallback,
            onAuthenticationComplete: onAuthenticationCompleteCallback,
            onError: onError
        )
        do {
           try await Footprint.initialize(with: config)
        } catch {
            throw FootprintError(kind: .webviewError, message: "Failed to initialize Footprint webview: \(error.localizedDescription)")
        }
    }
    
    
    public func handoff(
        onCancel: (() -> Void)? = nil,
        onComplete: ((_ validationToken: String) -> Void)? = nil,
        onError: ((_ errorMessage: String) -> Void)? = nil
    ) async throws {
        guard let authToken = self.verifiedAuthToken else {
            throw FootprintError(kind: .authError, message: "Missing authentication token")
        }
        
        guard let obConfigKind = self.onboardingConfig?.kind else {
            throw FootprintError(kind: .initializationError, message: "Missing onboarding configuration kind")
        }
        
        if obConfigKind != .kyc {
            throw FootprintError(kind: .notAllowed, message: "Unsupported onboarding configuration kind. Only KYC is supported")
        }
        
        let config = FootprintConfiguration(
            publicKey: self.configKey,
            authToken:  authToken,
            sandboxId: self.sandboxId,
            sandboxOutcome: self.sandboxOutcome,
            scheme: "footprintapp-callback",
            l10n: self.l10n,
            appearance: self.appearance,
            isAuthPlaybook: false,
            isComponentsSdk: true,
            shouldRelayToComponents: false,
            onCancel: onCancel,
            onComplete: onComplete,
            onError: onError
        )
        do{
            try await Footprint.initialize(with: config)
        } catch {
            throw FootprintError(kind: .webviewError, message: "Failed to initialize Footprint webview: \(error.localizedDescription)")
        }
    }
}
