import Foundation
import OpenAPIRuntime
import OpenAPIURLSession
import CustomDump

public final class FootprintProvider {
    private var client: Client
    private var configKey: String = ""
    private var queries: FootprintQueries!
    var onboardingConfig: Components.Schemas.PublicOnboardingConfiguration?
    var signupChallengeResponse: Components.Schemas.SignupChallengeResponse?
    var identifyResponse: Components.Schemas.IdentifyResponse?
    var verifyResponse: Components.Schemas.IdentifyVerifyResponse?
    var vaultingTokenResponse: Components.Schemas.CreateUserTokenResponse?
    private var sandboxId: String
    
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
        self.sandboxId = String(UUID().uuidString.prefix(11).filter { $0.isLetter || $0.isNumber })
    }
    
    public func initialize(configKey: String) async throws {
        self.configKey = configKey
        self.queries = FootprintQueries(client: self.client, configKey: self.configKey)
        
        self.onboardingConfig  = try await self.queries.getOnboardingConfig()
        customDump(self.onboardingConfig)            
    }

    public func identify(email: String, phoneNumber: String) async throws  {        
            self.identifyResponse = try await self.queries.identify(email: email, phoneNumber: phoneNumber)            
            customDump(self.identifyResponse)
            
        if identifyResponse?.user == nil {
                self.signupChallengeResponse = try await self.queries.getSignupChallenge(
                    email: email, 
                    phoneNumber: phoneNumber,
                    sandboxId: sandboxId
                )
                customDump(self.signupChallengeResponse)
        }
    }

    public func submitOTPCode(code: String) async throws {
        guard let challengeToken = self.signupChallengeResponse?.challenge_data.challenge_token,
              let authToken = self.signupChallengeResponse?.challenge_data.token else {
            throw NSError(domain: "SubmitOTPError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing challenge token or auth token"])
        }
        
        self.verifyResponse = try await self.queries.verify(
            challenge: code,
            challengeToken: challengeToken,
            authToken: authToken
        )       
        guard let authToken = self.verifyResponse?.auth_token else {
            throw NSError(domain: "InitOnboardingError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        }        
        try await self.queries.initOnboarding(authToken: authToken)        
        self.vaultingTokenResponse = try await self.queries.vaultingToken(authToken: authToken)
        customDump(self.vaultingTokenResponse)        
    }


    public func vault(vaultData: VaultData) async throws {
        guard let vaultAuthToken = self.vaultingTokenResponse?.token else {
            throw NSError(domain: "VaultError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        }
        
        let response = try await self.queries.vault(authToken: vaultAuthToken, vaultData: vaultData)
        customDump(response)
    }


    public func process() async throws {
        guard let authToken = self.verifyResponse?.auth_token else {
            throw NSError(domain: "ProcessError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Missing authentication token"])
        }        
        
        let response = try await self.queries.process(authToken: authToken)
        customDump(response)
    }

   
}
