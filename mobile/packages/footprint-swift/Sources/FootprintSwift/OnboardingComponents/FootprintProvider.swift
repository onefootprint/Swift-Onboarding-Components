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
    private var sandboxId: String
    
    public static let shared: FootprintProvider = {
        let instance = FootprintProvider()
        return instance
    }()
    
    private init() {
        self.client = Client(serverURL: try!Servers.server1(), transport: URLSessionTransport())
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
       self.verifyResponse = try await self.queries.verify(
            challenge: code, 
            challengeToken: self.signupChallengeResponse?.challenge_data.challenge_token ?? "",
            authToken: self.signupChallengeResponse?.challenge_data.token ?? ""
            )
        customDump(self.verifyResponse)
    }

}
