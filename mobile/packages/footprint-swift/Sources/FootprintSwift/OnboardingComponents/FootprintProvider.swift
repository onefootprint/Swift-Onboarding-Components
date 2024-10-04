import Foundation
import OpenAPIRuntime
import OpenAPIURLSession
import CustomDump

public final class FootprintProvider {
    private var client: Client
    private var configKey: String = ""
    private var authToken: String?
    private var vaultAuthToken: String?
    private var queries: FootprintQueries!
    var onboardingConfig: Components.Schemas.PublicOnboardingConfiguration?
    var signupChallengeResponse: Components.Schemas.SignupChallengeResponse?
    var loginChallengeResponse: Components.Schemas.LoginChallengeResponse?
    private var sandboxId: String = String(UUID().uuidString.prefix(12).filter { $0.isLetter || $0.isNumber })
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
        if let sandboxId = sandboxId {
            self.sandboxId = sandboxId
        }
        self.onboardingConfig  = try await self.queries.getOnboardingConfig()
        customDump(self.onboardingConfig)
    }

    public func createEmailPhoneBasedChallenge(email: String, phoneNumber: String) async throws  {
        let identifyResponse = try await self.queries.identify(email: email, phoneNumber: phoneNumber)
        customDump(identifyResponse)
        
        if identifyResponse.user == nil {
            self.signupChallengeResponse = try await self.queries.getSignupChallenge(
                email: email,
                phoneNumber: phoneNumber,
                sandboxId: self.sandboxId
            )
            customDump(self.signupChallengeResponse)
    } else {
        self.authToken = identifyResponse.user?.token
        self.loginChallengeResponse = try await self.queries.getLoginChallenge(authToken: self.authToken!)
    }
    }
    
    
    public func createAuthTokenBasedChallenge() async throws  {
        let identifyResponse = try await self.queries.identify(authToken: self.authToken) 
        customDump(self.signupChallengeResponse)
        
        if identifyResponse.user != nil {
            self.authToken = identifyResponse.user?.token
            self.loginChallengeResponse = try await self.queries.getLoginChallenge(authToken: self.authToken!)
            customDump(self.signupChallengeResponse)
         }
    }

    public func verify(verificationCode: String) async throws {
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
          guard let authToken = self.authToken else {
            throw NSError(domain: "VerifyError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        } 

        try await self.queries.initOnboarding(authToken: authToken, overallOutcome: self.sandboxOutcome?.overallOutcome)        
        let vaultingTokenResponse = try await self.queries.vaultingToken(authToken: authToken)

        self.vaultAuthToken = vaultingTokenResponse.token
    }


    public func vault(vaultData: VaultData) async throws {
        guard let vaultAuthToken = self.vaultAuthToken else {
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        }
        
        try await self.queries.vault(authToken: vaultAuthToken, vaultData: vaultData)        
    }


    public func process() async throws {
        guard let authToken = self.authToken else {
            throw NSError(domain: "ProcessError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        }        
        
        try await self.queries.process(authToken: authToken, overallOutcome: self.sandboxOutcome?.overallOutcome)
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
                customDump(config)
                try await Footprint.initialize(with: config)
    }
}
