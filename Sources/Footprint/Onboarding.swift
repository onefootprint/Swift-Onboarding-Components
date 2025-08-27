//
//  Onboarding.swift
//  Footprint
//
//  Created by D M Raisul Ahsan on 7/21/25.
//

extension OnboardingExpressResponse: @unchecked @retroactive Sendable {}
extension OnboardingExpressResponseComplete: @unchecked Sendable {}
extension OnboardingExpressResponseIncomplete: @unchecked Sendable {}



public final class Onboarding: Sendable {
    public static let shared = Onboarding()
    
    private init() {}
    
    private func toKotlinBoolean(_ value: Bool?) -> KotlinBoolean? {
        guard let value else { return nil }
        return KotlinBoolean(value: value)
    }
    
    private func getFingerprintVisitKey(
        authToken: String
    ) async throws -> (visitorId: String, requestId: String)?  {
        let config = try await Footprint.shared.getOnboardingConfig(authToken: authToken)
        guard let fpPublicKey = config.fpPublicKey else { return nil }
        let fingerprintCredentials = try await getFingerprintCredentials(apiKey: fpPublicKey)
        return fingerprintCredentials
    }
    
    private func runOnboardingInBackground(
        authToken: String
    ) async throws -> OnboardingExpressResponse {
        let fingerprintCredentials = try await getFingerprintVisitKey(
            authToken: authToken
        )
        
        let result = try await Footprint.shared.postHostedOnboardingSilent(
            authToken: authToken,
            fingerprintVisitRequest: {
                guard let creds = fingerprintCredentials else { return nil }
                return FingerprintVisitRequest(
                    path: .onboardStart,
                    requestId: creds.requestId,
                    visitorId: creds.visitorId
                )
            }()
        )
        
        return result
    }
    
    @MainActor
    public func initialize(
        onboardingSessionToken: String,
        l10n: FootprintL10n? = nil,
        sessionId: String? = nil,
        onComplete: ((String) -> Void)? = nil,
        onCancel: (() -> Void)? = nil,
        onError: ((FootprintException) -> Void)? = nil,
        appearance: FootprintAppearance? = nil
    ){
        func launchHostedFlow(
            authToken: String
        ){
            FootprintHosted.shared.launchHosted(
                authToken: authToken,
                l10n: l10n,
                onComplete: onComplete ?? {_ in},
                onCancel: onCancel ?? {},
                onError: { error in
                    onError?(
                        FootprintException(
                            kind: .sdkError,
                            message: error,
                            supportId: nil,
                            sessionId: sessionId,
                            context: nil,
                            code: nil
                        )
                    )
                },
                appearance: appearance,
                sessionId: sessionId
            )
        }
        
        Task{
            do {
                let silentOnboardingResult = try await self.runOnboardingInBackground(authToken: onboardingSessionToken)
                
                // If silent onboarding is successful and complete, we can return the validation token
                if let complete = silentOnboardingResult as? OnboardingExpressResponseComplete {
                    onComplete?(complete.validationToken)
                    return
                }
                
                // If silent onboarding is not successful, not complete, or not required, we proceed with the hosted flow
                let updatedAuthToken: String = (silentOnboardingResult as? OnboardingExpressResponseIncomplete)?.authToken ?? onboardingSessionToken
                
                launchHostedFlow(authToken: updatedAuthToken)
            } catch {
                if let fpException = extractFootprintException(error) {
                    if(fpException.code == "E117"){
                        onError?(fpException)
                        return
                    }
                }
                
                launchHostedFlow(authToken: onboardingSessionToken)
            }
        }
    }
}
