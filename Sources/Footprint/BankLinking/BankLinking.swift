//
//  FootprintBankLinkingWithAuthToken.swift
//  Footprint
//
//  Created by D M Raisul Ahsan on 4/21/25.
//
import SwiftUI
import SwiftOnboardingComponentsShared

public struct BankLinkingCompletionResponse {
    public let validationToken: String
    public let meta: BankLinkingCompletionMeta
}

public struct BankLinking: View {
    private let onboardingSessionToken: String
    private var onSuccess: ((BankLinkingCompletionResponse) -> Void)? = nil
    private var onError: ((FootprintException) -> Void)? = nil
    private var onClose: (() -> Void)? = nil
    private var onEvent: ((FootprintBankLinkingEvent) -> Void)? = nil
    private var sessionId: String? = nil
    private let redirectUri: String
    @State private var initialized: Bool = false
    
    public init(
        onboardingSessionToken: String,
        redirectUri: String,
        onSuccess: ((BankLinkingCompletionResponse) -> Void)? = nil,
        onError: ((FootprintException) -> Void)? = nil,
        onClose: (() -> Void)? = nil,
        onEvent: ((FootprintBankLinkingEvent) -> Void)? = nil,
        sessionId: String? = nil
    ) {
        self.onboardingSessionToken = onboardingSessionToken
        self.redirectUri = redirectUri
        self.onSuccess = onSuccess
        self.onError = onError
        self.onClose = onClose
        self.onEvent = onEvent
        self.sessionId = sessionId
    }
    
    func logError(_ error: Error) {
        Task.detached {
            let footprintError = (error as? FootprintException) ?? FootprintException(
                kind: FootprintException.ErrorKind.bankLinkingError,
                message: error.localizedDescription,
                supportId: nil,
                sessionId: sessionId,
                context: nil,
                code: nil
            )
            await Footprint.shared.logError(error: footprintError)
        }
    }
    
    public var body: some View {
        VStack {
            if !initialized {
                // Loading
                VStack(spacing: 16) {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .scaleEffect(1.5)
                }
            } else {
                BankLinkingComponent(
                    redirectUri: self.redirectUri,
                    onSuccess: { meta in
                        Task {
                            do {
                                let validationToken = try await Footprint.shared.process()
                                self.onSuccess?(
                                    BankLinkingCompletionResponse(
                                        validationToken: validationToken,
                                        meta: meta
                                    )
                                )
                            } catch {
                                let footprintError = (error as? FootprintException) ?? FootprintException(
                                    kind: FootprintException.ErrorKind.bankLinkingError,
                                    message: error.localizedDescription,
                                    supportId: nil,
                                    sessionId: sessionId,
                                    context: nil,
                                    code: nil
                                )
                                
                                logError(error)
                                onError?(footprintError)
                            }
                        }
                    },
                    onError: { error in
                        self.onError?(error)
                    },
                    onClose: self.onClose,
                    onEvent: self.onEvent
                )
            }
        }
        .onAppear {
            Task {
                do {
                    try await Footprint.shared.initializeWithAuthToken(
                        authToken: onboardingSessionToken,
                        sessionId: sessionId
                    )
                    initialized = true
                } catch {
                    let footprintError = (error as? FootprintException) ?? FootprintException(
                        kind: FootprintException.ErrorKind.bankLinkingError,
                        message: error.localizedDescription,
                        supportId: nil,
                        sessionId: sessionId,
                        context: nil,
                        code: nil
                    )
                    
                    logError(error)
                    onError?(footprintError)
                }
            }
        }
    }
}
