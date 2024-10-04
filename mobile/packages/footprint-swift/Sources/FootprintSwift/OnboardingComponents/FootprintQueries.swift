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

    func identify(email: String, phoneNumber: String) async throws -> Components.Schemas.IdentifyResponse {
        let input = Operations.identify.Input(
            headers: Operations.identify.Input.Headers(
                X_hyphen_Onboarding_hyphen_Config_hyphen_Key: self.configKey
            ),
            body: .json(Components.Schemas.IdentifyRequest(
                email: email, phone_number: phoneNumber, scope: Components.Schemas.IdentifyRequest.scopePayload.onboarding
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

    func getSignupChallenge(email: String, phoneNumber: String, sandboxId: String) async throws -> Components.Schemas.SignupChallengeResponse {
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
}
