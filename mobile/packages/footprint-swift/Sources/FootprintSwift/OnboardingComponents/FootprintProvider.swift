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
    private var queries: FootprintQueries!
    private var onboardingConfig: Components.Schemas.PublicOnboardingConfiguration?
    private var signupChallengeResponse: Components.Schemas.SignupChallengeResponse?
    private var loginChallengeResponse: Components.Schemas.LoginChallengeResponse?
    private var requirements : RequirementAttributes?
    private var sandboxId: String?  = nil
    private var sandboxOutcome: SandboxOutcome?
    private var l10n: FootprintL10n?
    private var appearance: FootprintAppearance?

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

    func createChallenge(email: String? = nil, phoneNumber: String? = nil, authToken: String? = nil) async throws  {
         guard let requiredAuthMethods = self.onboardingConfig?.required_auth_methods else {
             throw ProviderError.providerError("No required auth methods found in the onboarding config")
         }
         
        let identifyResponse = try await self.queries.identify(email: email, phoneNumber: phoneNumber, authToken: authToken, sandboxId: self.sandboxId)
        
        if let user = identifyResponse.user {            
            let hasVerifiedSource = user.auth_methods.contains { $0.is_verified }          
                guard hasVerifiedSource else {
                    throw ProviderError.providerError("Cannot verify inline")
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


    public func createEmailPhoneBasedChallenge(email: String, phoneNumber: String) async throws  {
        try await createChallenge(email: email, phoneNumber: phoneNumber)
    }

    public func createAuthTokenBasedChallenge() async throws  {
        try await createChallenge(authToken: self.authToken)
    }

    public func verify(verificationCode: String) async throws -> Verify {
        guard let challengeToken = self.loginChallengeResponse?.challenge_data.challenge_token ??  self.signupChallengeResponse?.challenge_data.challenge_token,
              let challengeAuthToken = self.loginChallengeResponse?.challenge_data.token ?? self.signupChallengeResponse?.challenge_data.token else {
            throw NSError(domain: "SubmitOTPError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing challenge token or auth token"])
        }
        
        let verifyResponse = try await self.queries.verify(
            challenge: verificationCode,
            challengeToken: challengeToken,
            authToken: challengeAuthToken
        )       
        self.authToken = verifyResponse.auth_token   
       
        try await self.queries.initOnboarding(authToken: verifyResponse.auth_token, overallOutcome: self.sandboxOutcome?.overallOutcome)
        let validationTokenResponse = try await self.queries.getValidationToken(authToken: verifyResponse.auth_token)         

        self.requirements = try await self.queries.getOnboardingStatus(authToken: verifyResponse.auth_token)
                        
        let vaultData  = try await getVaultData()            
    
        return  Verify(requirements: requirements!, validationToken: validationTokenResponse.validation_token, vaultData: vaultData)
    }
    
    public func getVaultData() async throws -> VaultData {
        guard let authToken = self.authToken else {
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        }        
        guard let requirements = self.requirements else {
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing requirements"])
        }
        
       return try await self.queries.decrypt(authToken: authToken,
                                       fields: requirements.fields.collected + requirements.fields.missing + requirements.fields.optional)
    }


    public func vault(vaultData: VaultData) async throws {
        guard let authToken = self.authToken else {
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        }
        
        try await self.queries.vault(authToken: authToken, vaultData: vaultData)
    }


    public func process() async throws -> Components.Schemas.HostedValidateResponse {
        guard let authToken = self.authToken else {
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
                    let config = FootprintConfiguration(
                        publicKey: self.configKey,
                        authToken:  self.authToken,
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
